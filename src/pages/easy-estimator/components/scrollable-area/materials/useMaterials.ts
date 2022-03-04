import { LOCAL_STORAGE_KEY } from '@common/constants';
import { PriceMode } from '@common/enums';
import { MaterialModel } from '@common/models';
import { showErrorNotification } from '@core/components/notifier-item/notifier-item';
import httpClientService from '@core/services/http-client-service';
import localStorageInfo from '@core/services/local-storage-info';
import { ColorContext, MaterialContext, StoreContext, ZipCodeContext } from '@ee-context';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThicknessContext } from '../../../context/thicknessContext';

const useMaterials = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [avgPriceMode, setPriceMode] = useState<PriceMode>(PriceMode.NONE);

    const { zipcode, isZipcodeSet } = useContext(ZipCodeContext);
    const { selectedStoreState } = useContext(StoreContext);
    const {
        materials,
        updateMaterials,
        selectedMaterialState,
        updateSelectedDefaultMaterial,
        updateSelectedMaterialByUser,
        updateLoadedMaterial,
    } = useContext(MaterialContext);
    const { updateSelectedDefaultColor, selectedColorState } = useContext(ColorContext);

    const { updateThicknessOptions, updateSelectedDefaultThickness } = useContext(ThicknessContext);

    const retailerSetting = localStorageInfo.getStorageData(LOCAL_STORAGE_KEY.RETAILER_SETTING);
    const { isSelectedByUser, isSelectedDefault } = selectedMaterialState;
    const selectedMaterial = selectedMaterialState.material;
    const isSelectedColorByUser = selectedColorState.isSelectedByUser;
    const isSelectedColorDefault = selectedColorState.isSelectedDefault;
    const selectedStore = selectedStoreState.store;

    useEffect(() => {
        !zipcode ? fetchMaterialsWithoutZipcode() : fetchMaterialsWithZipcode();
    }, [zipcode, selectedStore]);

    useEffect(() => {
        // first material is selected by default if the selectedMaterial doesn't match the new list of materials
        if (materials && materials.length > 0 && !isSelectedByUser) updateSelectedDefaultMaterial(materials[0]);
    }, [materials]);

    // clean up the thickness options array and the selected thickness option when the material is changed
    useEffect(() => {
        updateThicknessOptions([]);
        updateSelectedDefaultThickness(undefined);
    }, [selectedMaterial]);

    const fetchMaterialsWithoutZipcode = () => {
        if (!retailerSetting) {
            return;
        }

        setLoading(true);
        setPriceMode(
            retailerSetting.materialPriceIndication.minMaxPrice
                ? PriceMode.MINMAX
                : retailerSetting.materialPriceIndication.averagePrice
                ? PriceMode.AVG
                : PriceMode.NONE,
        );

        (async () => {
            try {
                const response = await httpClientService.get('/products/groups');
                updateMaterials(response.data);

                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        })();
    };

    const fetchMaterialsWithZipcode = () => {
        if (!retailerSetting || !zipcode || !selectedStore) {
            return;
        }

        updateMaterials(undefined);
        let url = `/products/groups?zipCode=${zipcode}`;
        if (retailerSetting.showStores) url = `${url}&storeId=${selectedStore?.companyId}`;

        setPriceMode(
            retailerSetting.materialPriceIndication.minMaxPrice
                ? PriceMode.MINMAX
                : retailerSetting.materialPriceIndication.averagePrice
                ? PriceMode.AVG
                : PriceMode.NONE,
        );

        setLoading(true);

        (async () => {
            try {
                const response = await httpClientService.get(url);

                updateLoadedMaterial(false);
                if (response.data.length > 0) {
                    showErrors(response.data);
                    updateMaterials(response.data);

                    updateLoadedMaterial(true);
                }
            } catch (error) {
                updateLoadedMaterial(false);
                console.log(error);
            } finally {
                setLoading(false);
            }
        })();
    };

    const showErrors = (materialsData: Array<MaterialModel>) => {
        // check if the previous selected material it is included in the list of materials after entering the zipcode
        const checkedMaterialIdx = materialsData.findIndex(
            (material: MaterialModel) => material.qteGrpID === selectedMaterial?.qteGrpID,
        );

        if (checkedMaterialIdx === -1) {
            if (isSelectedByUser && isSelectedColorDefault) {
                // TO DO: remove all notifications error when we have the final validation
                if (!isZipcodeSet)
                    showErrorNotification(
                        t('SCROLLABLE_AREA.MATERIAL.TITLE_UNAVAILABLE_MATERIAL_SELECTION'),
                        t('SCROLLABLE_AREA.MATERIAL.UNAVAILABLE_MATERIAL_SELECTION_SELECTION'),
                        t('SCROLLABLE_AREA.MATERIAL.SEND_EMAIL'),
                    );

                updateSelectedDefaultMaterial(materialsData[0]);
            } else if ((isSelectedByUser || isSelectedDefault) && isSelectedColorByUser) {
                if (!isZipcodeSet)
                    showErrorNotification(
                        t('SCROLLABLE_AREA.MATERIAL.TITLE_UNAVAILABLE_MATERIAL_COLOR_SELECTION'),
                        t('SCROLLABLE_AREA.MATERIAL.UNAVAILABLE_MATERIAL_COLOR_SELECTION_SELECTION'),
                        t('SCROLLABLE_AREA.MATERIAL.SEND_EMAIL'),
                    );

                updateSelectedDefaultMaterial(materialsData[0]);
                updateSelectedDefaultColor(undefined);
            }
        } else if (isSelectedByUser) {
            updateSelectedMaterialByUser(materialsData[checkedMaterialIdx]);
        }
    };

    return {
        selectedStore,
        zipcode,
        materials,
        loading,
        selectedMaterial,
        updateSelectedMaterialByUser,
        updateSelectedDefaultMaterial,
        updateSelectedDefaultColor,
        avgPriceMode,
    };
};

export default useMaterials;
