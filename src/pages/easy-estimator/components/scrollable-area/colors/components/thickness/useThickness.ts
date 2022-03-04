import { ThicknessOption } from '@common/models';
import { PredefinedThicknessOption } from '@common/models/predefined-thickness-option.model';
import { ColorContext, ThicknessContext, ZipCodeContext } from '@ee-context';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';

const useThickness = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const {
        thicknessOptions,
        updateThicknessOptions,
        selectedThicknessOption,
        updateSelectedDefaultThickness,
        updateSelectedThicknessByUser,
    } = useContext(ThicknessContext);
    const { colors, selectedColorState } = useContext(ColorContext);
    const { zipcode } = useContext(ZipCodeContext);

    const { isSelectedByUser } = selectedThicknessOption;
    const colorThicknessOptions = selectedColorState.color.thicknessOptions;

    /**
     * Used to fetch the predefined thickness options.
     */
    const fetchPredefinedThicknessOptions = (cancelled: boolean) => {
        if (!colors || colorThicknessOptions.length < 2) {
            return;
        }

        (async () => {
            try {
                setLoading(true);
                const response = await axios.get(`./public/assets/predefined-thickness-options.json`);
                if (!cancelled) {
                    updateThicknessOptions(addQteGrpIDToThicknessOptions(response.data));
                }
            } catch (error) {
                setError(true);
            } finally {
                setLoading(false);
            }
        })();
    };

    const addQteGrpIDToThicknessOptions = (thicknessOptionsResponse: PredefinedThicknessOption[]) => {
        thicknessOptionsResponse.forEach((thicknessOption: PredefinedThicknessOption) => {
            colorThicknessOptions.forEach((colorThicknessOption: ThicknessOption) => {
                if (colorThicknessOption.thickness === thicknessOption.type) {
                    thicknessOption.qteGrpID = colorThicknessOption.qteGrpID;
                }
            });
        });

        return thicknessOptionsResponse;
    };

    useEffect(() => {
        let cancelled = false;
        if (zipcode && colors && colors.length > 0) {
            fetchPredefinedThicknessOptions(cancelled);
        }
        return () => {
            cancelled = true;
        };
    }, [colors, zipcode]);

    useEffect(() => {
        if (
            zipcode &&
            colors &&
            colors.length > 0 &&
            selectedColorState &&
            colorThicknessOptions.length > 1 &&
            !isSelectedByUser
        )
            updateSelectedDefaultThickness(thicknessOptions[0]);
    }, [zipcode, selectedColorState, thicknessOptions, colors]);

    return {
        loading,
        error,
        thicknessOptions,
        updateThicknessOptions,
        selectedThicknessOption,
        updateSelectedDefaultThickness,
        updateSelectedThicknessByUser,
    };
};

export default useThickness;
