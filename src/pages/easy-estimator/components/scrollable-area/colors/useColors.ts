import { DISCONTINUED, LOCAL_STORAGE_KEY } from '@common/constants';
import { ColorModel } from '@common/models';
import { defaultUrl } from '@common/utils';
import { showErrorNotification } from '@core/components';
import httpClientService from '@core/services/http-client-service';
import localStorageInfo from '@core/services/local-storage-info';
import { ColorContext, MaterialContext, StoreContext, ThicknessContext, ZipCodeContext } from '@ee-context';
import axios, { CancelTokenSource } from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SortBy } from './colors';
import { PredefinedThicknessOptionType } from '@common/enums/predefined-thickness-options';

const useColors = () => {
    const { t } = useTranslation();
    const { zipcode, isZipcodeSet } = useContext(ZipCodeContext);
    const { selectedStoreState, loadedStore } = useContext(StoreContext);
    const { materials, selectedMaterialState, loadedMaterial } = useContext(MaterialContext);
    const {
        colors,
        updateColors,
        filteredColors ,
        selectedColorState,
        updateSelectedColorByUser,
        updateSelectedDefaultColor,
    } = useContext(ColorContext);

    const { selectedThicknessOption, thicknessOptions } = useContext(ThicknessContext);

    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState<SortBy>();

    const retailerSetting = localStorageInfo.getStorageData(LOCAL_STORAGE_KEY.RETAILER_SETTING);
    const selectedMaterial = selectedMaterialState.material;
    const { isSelectedByUser } = selectedColorState;
    const selectedColor = selectedColorState.color;
    const selectedStore = selectedStoreState.store;
    const selectedThickness = selectedThicknessOption.thickness;

    useEffect(() => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        /** Don't do again the request if the default thickness (3CM) is selected
         *  because by default the displayed colors correspond to a thickness of 3 CM.
         */
        if (isDefaultThicknessOptionSelected()) {
            return;
        }

        !zipcode ? fetchColorsWithoutZipCode(source) : fetchColorsWithZipCode(source);

        return () => source.cancel();
    }, [selectedMaterial, zipcode, loadedStore, materials, loadedMaterial, selectedThickness]);

    useEffect(() => {
        if (colors && colors.length > 0 && !isSelectedByUser) updateSelectedDefaultColor(colors[0]);
    }, [colors, zipcode]);

    const isDefaultThicknessOptionSelected = () => {
        return (
            thicknessOptions &&
            thicknessOptions.length > 0 &&
            selectedThickness &&
            selectedThicknessOption.isSelectedDefault
        );
    };

    const fetchColorsWithoutZipCode = (source: CancelTokenSource) => {
        updateColors([]);
        setSortBy(undefined);
        if (!selectedMaterial) {
            return;
        }

        let url = `products/colors?prodQteGrpID=${selectedMaterial.qteGrpID}`;

        setLoading(true);

        (async () => {
            try {
                const response = await httpClientService.get(url, source.token);

                let colorsData: ColorModel[] = response.data;
                colorsData.forEach((color: ColorModel) => {
                    if (!color.swatchImageUrl) {
                        color.swatchImageUrl = defaultUrl;
                    }
                });
                colorsData = colorsData.filter((color: ColorModel) => !color.name.toLowerCase().includes(DISCONTINUED));

                updateColors(colorsData);
                setLoading(false);
            } catch (error) {
                // check if the request was cancelled
                if (!axios.isCancel(error)) {
                    setLoading(false);
                }
            }
        })();
    };

    const fetchColorsWithZipCode = (source: CancelTokenSource) => {
        updateColors([]);
        setSortBy(undefined);
        if (!zipcode || !selectedMaterial || !materials || !retailerSetting || !loadedStore || !loadedMaterial) {
            return;
        }

        const qteGrpID =
            selectedThickness && selectedThickness.qteGrpID ? selectedThickness.qteGrpID : selectedMaterial.qteGrpID;

        let url = `products/colors?zipCode=${zipcode}&prodQteGrpID=${qteGrpID}`;
        if (retailerSetting.showStores) url = `${url}&storeId=${selectedStore?.companyId}`;

        setLoading(true);

        (async () => {
            try {
                const response = await httpClientService.get(url, source.token);
                processZipColors(response.data);
                setLoading(false);
            } catch (error) {
                // check if the request was cancelled
                if (!axios.isCancel(error)) {
                    setLoading(false);
                }
            }
        })();
    };

    const processZipColors = (colorsData: ColorModel[]) => {
        colorsData.forEach((color: ColorModel) => {
            if (!color.swatchImageUrl) {
                color.swatchImageUrl = defaultUrl;
            }
        });
        colorsData = colorsData.filter((color: ColorModel) => color?.price > 0);
        colorsData = colorsData.filter((color: ColorModel) => !color.name.toLowerCase().includes(DISCONTINUED));

        // check if there are colors with more than one thickness option
        const moreThanOneThicknessOption = colorsData.some((color: ColorModel) => color.thicknessOptions.length > 1);

        if (moreThanOneThicknessOption) {
            // if this is the first time when the request is made then the thickness is not set,
            // and then if "isSelectedDefault" flag is present we know that the 3CM is the default value,
            // and we filter out all the colors that doesn't have the 3CM thickness option
            if (selectedThicknessOption.isSelectedDefault) {
                colorsData = colorsData.filter((color: ColorModel) => {
                    return color.thicknessOptions.some((thicknessOption) => {
                        return thicknessOption.thickness === PredefinedThicknessOptionType['3CM'];
                    });
                });
            }
            //if the thickness is selected by the user then we use the selected thickness to filter the colors
            else if (selectedThicknessOption.isSelectedByUser) {
                colorsData = colorsData.filter((color: ColorModel) => {
                    return color.thicknessOptions.some((thicknessOption) => {
                        return thicknessOption.thickness === selectedThicknessOption.thickness.type;
                    });
                });
            }
        }

        // check if the previous selected color  it is included in the new list of colors after entering the zipcode
        const checkedColorByProductNameIdx = colorsData.findIndex(
            (color: ColorModel) => color.name === selectedColor?.name,
        );

        if (checkedColorByProductNameIdx === -1 && isSelectedByUser) {
            // TO DO: remove all notifications error when we have the final validation
            if (!isZipcodeSet)
                showErrorNotification(
                    t('SCROLLABLE_AREA.COLOR.TITLE_UNAVAILABLE_COLOR_SELECTION'),
                    t('SCROLLABLE_AREA.COLOR.UNAVAILABLE_SELECTION'),
                    t('SCROLLABLE_AREA.COLOR.SEND_EMAIL'),
                );

            updateSelectedDefaultColor(colorsData[0]);
        } else if (isSelectedByUser) {
            updateSelectedColorByUser(colorsData[checkedColorByProductNameIdx]);
        }

        updateColors(colorsData);
    };

    return {
        sortBy,
        selectedStore,
        zipcode,
        colors,
        setSortBy,
        loading,
        filteredColors,
        selectedColor,
        updateSelectedDefaultColor,
        updateSelectedColorByUser
    };
};

export default useColors;
