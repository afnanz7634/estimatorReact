import { useContext, useEffect } from 'react';
import { ColorContext } from '@ee-context';
import { ColorModel } from '@common/models';
import { COLOR_BRAND, COLOR_CATEGORY } from '@common/constants';

const useFilters = (): void => {
    const { colors, updateFilteredColors, colorFilters } = useContext(ColorContext);

    useEffect(() => {
        let allColors = colors;
        let selectedFilters: string[] = [];

        const categories = colorFilters.Color;
        if (categories) {
            categories.filterOption.forEach((option: { isSelected: boolean; name: string }) => {
                if (option.isSelected) {
                    selectedFilters.push(option.name);
                }
            });

            if (selectedFilters.length > 0) {
                allColors = allColors.filter((color: ColorModel) => selectedFilters.includes(color[COLOR_CATEGORY]));
            }
        }

        const brands = colorFilters.Brands;

        if (brands) {
            selectedFilters = [];
            brands.filterOption.forEach((option: { isSelected: boolean; name: string }) => {
                if (option.isSelected) {
                    selectedFilters.push(option.name);
                }
            });

            if (selectedFilters.length > 0) {
                allColors = allColors.filter((color: ColorModel) => selectedFilters.includes(color[COLOR_BRAND]));
            }
        }

        updateFilteredColors(allColors);
    }, [colorFilters]);
};

export default useFilters;
