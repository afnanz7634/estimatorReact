import { LOCAL_STORAGE_KEY } from '@common/constants';
import { CornerInfo, CornerRadiusModel, DrawingShape } from '@common/models';
import httpClientService from '@core/services/http-client-service';
import localStorageInfo from '@core/services/local-storage-info';
import { CornerRadiusContext, DrawingShapeContext, MaterialContext, StoreContext, ZipCodeContext } from '@ee-context';
import { useContext, useEffect, useState } from 'react';

const useCornerRadius = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const { zipcode } = useContext(ZipCodeContext);
    const { selectedStoreState, loadedStore } = useContext(StoreContext);
    const { selectedMaterialState, loadedMaterial } = useContext(MaterialContext);
    const {
        cornerRadii,
        updateCornerRadii,
        selectedCornerRadiusOnCardState,
        updateSelectedCornerRadiusByDefault,
        updateSelectedCornerRadiusByUser,
    } = useContext(CornerRadiusContext);
    const { drawingShapes } = useContext(DrawingShapeContext);
    const selectedMaterial = selectedMaterialState.material;
    const selectedStore = selectedStoreState.store;
    const selectedCornerRadiusOnCard = selectedCornerRadiusOnCardState.cornerRadius;
    const { isSelectedByUser } = selectedCornerRadiusOnCardState;

    // when changing material, check if the previous selected corners on shapes have the same name and update them with the new productID
    const checkPreviousCornerRadiiOnDrawing = (newCornerRadiiData: CornerRadiusModel[]) => {
        if (!drawingShapes?.length) {
            return;
        }

        drawingShapes.forEach((drawingShape: DrawingShape) => {
            const cornerRadiiInfo = Object.values(drawingShape.cornerMap);
            cornerRadiiInfo.forEach((cornerRadiusInfo: CornerInfo) => {
                newCornerRadiiData.map((corner: CornerRadiusModel) => {
                    if (cornerRadiusInfo?.label) {
                        const check = cornerRadiusInfo.label.includes(corner.name);
                        if (check) cornerRadiusInfo.productId = corner.productId;
                    }
                });
            });
        });
    };

    const checkPreviousSelectedCornerRadiusOnCard = (cornerRadii: CornerRadiusModel[]) => {
        const checkedPrevCornerRadiusIdx = cornerRadii.findIndex(
            (cornerRadius: CornerRadiusModel) => cornerRadius.name === selectedCornerRadiusOnCard.name,
        );
        checkedPrevCornerRadiusIdx !== -1 && isSelectedByUser
            ? updateSelectedCornerRadiusByDefault(cornerRadii[checkedPrevCornerRadiusIdx])
            : updateSelectedCornerRadiusByDefault(cornerRadii[0]);
    };

    const getCornerRadiiBySelectedMaterial = async () => {
        try {
            const retailerSetting = localStorageInfo.getStorageData(LOCAL_STORAGE_KEY.RETAILER_SETTING);
            if (!zipcode || !selectedMaterial || !loadedStore || !loadedMaterial) {
                return;
            }

            let url = `products/radii?zipCode=${zipcode}&prodQteGrpID=${selectedMaterial.qteGrpID}`;
            if (retailerSetting.showStores) url = `${url}&storeId=${selectedStore?.companyId}`;

            setLoading(true);
            setError(false);
            const response = await httpClientService.get(url);

            const cornerRadiiData: CornerRadiusModel[] = response.data;
            checkPreviousCornerRadiiOnDrawing(cornerRadiiData);

            cornerRadiiData.forEach((cornerRadius: CornerRadiusModel) => {
                if (!cornerRadius.imageUrl) {
                    cornerRadius.imageUrl = '/public/mock/images/coming_soon.svg';
                }
            });
            selectedCornerRadiusOnCard
                ? checkPreviousSelectedCornerRadiusOnCard(cornerRadiiData)
                : updateSelectedCornerRadiusByDefault(cornerRadiiData[0]);

            updateCornerRadii(cornerRadiiData);

            setLoading(false);
        } catch (error) {
            setLoading(false);
            setError(true);
        }
    };

    useEffect(() => {
        getCornerRadiiBySelectedMaterial();
    }, [selectedMaterial, zipcode, loadedStore, loadedMaterial]);

    return {
        loading,
        error,
        cornerRadii,
        selectedMaterial,
        drawingShapes,
        zipcode,
        selectedCornerRadiusOnCard,
        updateSelectedCornerRadiusByUser,
    };
};

export default useCornerRadius;
