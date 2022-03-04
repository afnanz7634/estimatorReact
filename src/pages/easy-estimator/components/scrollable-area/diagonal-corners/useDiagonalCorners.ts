import { LOCAL_STORAGE_KEY } from '@common/constants';
import { DrawingShapeContext, MaterialContext, StoreContext, ZipCodeContext } from '@ee-context';
import { useContext, useEffect, useState } from 'react';
import httpClientService from '../../../../../core/services/http-client-service';
import localStorageInfo from '../../../../../core/services/local-storage-info';
import { DiagonalCornerContext } from '../../../context/diagonalCornerContext';
import './diagonal-corners.scss';

const useDiagonalCorners = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const { zipcode } = useContext(ZipCodeContext);
    const { selectedStoreState, loadedStore } = useContext(StoreContext);
    const { selectedMaterialState, loadedMaterial } = useContext(MaterialContext);
    const { diagonalCorners, updateDiagonalCorners, selectedDiagonalCorner, updateSelectedDiagonalCorner } =
        useContext(DiagonalCornerContext);
    const { drawingShapes } = useContext(DrawingShapeContext);
    const selectedMaterial = selectedMaterialState.material;
    const selectedStore = selectedStoreState.store;

    const getDiagonalCornersBySelectedMaterial = async () => {
        try {
            if (!zipcode || !selectedMaterial || !loadedStore || !loadedMaterial) {
                return;
            }

            if (selectedDiagonalCorner) {
                updateSelectedDiagonalCorner(undefined);
            }

            let url = `/products/diagonal-corners?zipCode=${zipcode}&prodQteGrpID=${selectedMaterial.qteGrpID}`;

            const retailerSetting = localStorageInfo.getStorageData(LOCAL_STORAGE_KEY.RETAILER_SETTING);

            if (retailerSetting.showStores) {
                url = `${url}&storeId=${selectedStore?.companyId}`;
            }

            setLoading(true);
            setError(false);
            const response = await httpClientService.get(url);
            updateDiagonalCorners(response.data);
        } catch (error) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const isDiagonalCornerOptionAvailable = () => {
        return drawingShapes.length > 0 && selectedMaterial && zipcode;
    };

    useEffect(() => {
        getDiagonalCornersBySelectedMaterial();
    }, [selectedMaterial, zipcode, loadedStore, loadedMaterial]);

    return {
        loading,
        error,
        diagonalCorners,
        selectedDiagonalCorner,
        updateSelectedDiagonalCorner,
        isDiagonalCornerOptionAvailable,
    };
};

export default useDiagonalCorners;
