import {
    DrawingShapeContext,
    MaterialContext,
    StoreContext,
    TearOutCountertopContext,
    ZipCodeContext,
} from '@ee-context';
import { useContext, useEffect, useState } from 'react';
import localStorageInfo from '@core/services/local-storage-info';
import { LOCAL_STORAGE_KEY } from '@common/constants';
import httpClientService from '@core/services/http-client-service';

const useTearOutCountertop = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const { tearOuts, updateTearOuts, selectedTearOut, updateSelectedTearOut } = useContext(TearOutCountertopContext);
    const { zipcode } = useContext(ZipCodeContext);
    const { selectedStoreState, loadedStore } = useContext(StoreContext);
    const { selectedMaterialState, loadedMaterial } = useContext(MaterialContext);
    const { drawingShapes } = useContext(DrawingShapeContext);

    const selectedStore = selectedStoreState.store;
    /**
     * Used to fetch the tear outs.
     */
    const fetchTearOuts = () => {
        (async () => {
            try {
                updateSelectedTearOut(new Map());

                if (!zipcode || !selectedMaterialState.material || !loadedStore || !loadedMaterial) {
                    return;
                }
                setLoading(true);
                const retailerSetting = localStorageInfo.getStorageData(LOCAL_STORAGE_KEY.RETAILER_SETTING);
                const qteGrpID = selectedMaterialState.material.qteGrpID;

                let url = `products/optional-items?zipCode=${zipcode}&prodQteGrpID=${qteGrpID}`;
                if (retailerSetting.showStores) url = `${url}&storeId=${selectedStore?.companyId}`;
                const response = await httpClientService.get(url);

                const receivedTearOuts = response.data['tear-outs'];

                updateTearOuts(receivedTearOuts);
            } catch (error) {
                setError(true);
            } finally {
                setLoading(false);
            }
        })();
    };

    useEffect(() => {
        fetchTearOuts();
    }, [selectedMaterialState.material, zipcode, loadedStore, loadedMaterial]);

    const areTearOutsAvailable = () => {
        return zipcode && selectedStore && selectedMaterialState.material && drawingShapes.length > 0;
    };

    return {
        loading,
        error,
        tearOuts,
        areTearOutsAvailable,
        selectedTearOut,
        updateSelectedTearOut,
    };
};

export default useTearOutCountertop;
