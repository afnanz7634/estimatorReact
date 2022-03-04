import { StoreModel } from '@common/models';
import useCurrentLocation from '@common/utils/useCurrentLocation';
import httpClientService from '@core/services/http-client-service';
import { StoreContext, ThicknessContext, ZipCodeContext } from '@ee-context';
import { useContext, useEffect, useState } from 'react';

const useAddress = () => {
    const { location, error } = useCurrentLocation();

    const [loading, setLoading] = useState(false);
    const { updateZipcodeFromLocation, zipcode } = useContext(ZipCodeContext);
    const { updateStores, updateLoadedStore } = useContext(StoreContext);
    const { stores, selectedStoreState, updateSelectedStoreByDefault, updateSelectedStoreByUser } =
        useContext(StoreContext);
    const selectedStore = selectedStoreState.store;
    const { isSelectedByUser } = selectedStoreState;

    const { updateThicknessOptions, updateSelectedDefaultThickness } = useContext(ThicknessContext);

    // clean up the thickness options array and the selected thickness option when the zipcode is changed
    useEffect(() => {
        updateThicknessOptions([]);
        updateSelectedDefaultThickness(undefined);
    }, [zipcode]);

    useEffect(() => {
        location ? fetchZipCode() : setLoading(false);
    }, [location, error]);

    useEffect(() => {
        // set first store as selected by default
        if (stores?.length > 0 && !isSelectedByUser) updateSelectedStoreByDefault(stores[0]);
    }, [stores]);

    const fetchStores = (code: string) => {
        setLoading(true);

        (async () => {
            try {
                const stores = await httpClientService.get(`/stores?zipCode=${code}`);
                // round to one decimal
                stores?.data?.forEach(
                    (store: StoreModel) => (store.distance = store.distance ? Math.round(store.distance * 10) / 10 : 0),
                );
                if (zipcode) {
                    let isTheSameZipcode = zipcode === code;
                    checkPrevSelectedStore(stores?.data, isTheSameZipcode);
                }

                updateStores(stores?.data);
                updateLoadedStore(true);
            } catch {
                // TODO add logger
                updateLoadedStore(false);
            } finally {
                setLoading(false);
            }
        })();
    };

    // check prev selected store only once the same zipcode is being introduced
    const checkPrevSelectedStore = (storesData: Array<StoreModel>, isTheSameZipcode: boolean) => {
        const checkedPrevStoreIdx = storesData.findIndex(
            (store: StoreModel) => store.companyId === selectedStore?.companyId,
        );

        if (!isTheSameZipcode) {
            updateSelectedStoreByDefault(stores[0]);
        } else if (checkedPrevStoreIdx !== -1 && isSelectedByUser) {
            updateSelectedStoreByUser(storesData[checkedPrevStoreIdx]);
        }
    };

    // retrieve zip code based on location
    const fetchZipCode = () => {
        setLoading(true);
        (async () => {
            try {
                const response = await httpClientService.get(
                    `/zip-code?latitude=${location?.latitude}&longitude=${location?.longitude}`,
                );

                if (response.data) {
                    updateZipcodeFromLocation(response.data);
                }

                if (error) updateZipcodeFromLocation('');
            } catch {
                // TODO add logger
                console.log('fetch zip error', error);
            } finally {
                setLoading(false);
            }
        })();
    };

    return {
        loading,
        fetchStores,
        fetchZipCode,
        selectedStore,
        updateLoadedStore,
        stores,
    };
};

export default useAddress;
