import { ColorModel, Filter } from '@common/models';
import { colorReducer, initialSelectedColor, SELECT_COLOR_BY_DEFAULT, SELECT_COLOR_BY_USER } from '@ee-reducer';
import { createContext, useReducer, useState } from 'react';
import { ColorFilterOptions } from '@common/enums';

export type ColorFilters = Record<ColorFilterOptions, Filter>;

export const ColorContext = createContext<any>({});

export const ColorContextProvider = (props: any) => {
    const [colors, setColors] = useState<ColorModel[]>([]);
    const [filteredColors, setFilteredColors] = useState<ColorModel[]>([]);
    const [selectedColorState, dispatch] = useReducer(colorReducer, initialSelectedColor);
    const [isFilterExpanded, setFilterExpanded] = useState(false);
    const [colorFilters, setColorFilters] = useState<ColorFilters>({
        Color: { filterOption: [], isExpanded: true },
        Brands: { filterOption: [], isExpanded: true },
    });

    const updateColors = (value: ColorModel[]) => {
        setColors(value);
        if (value) {
            setFilteredColors(value);
            initializeFiltersOptions(value);
        }
    };

    const updateFilteredColors = (value: ColorModel[]) => {
        setFilteredColors(value);
        updateFiltersOptions();
    };

    const updateSelectedDefaultColor = (value: ColorModel) => {
        dispatch({ type: SELECT_COLOR_BY_DEFAULT, payload: { color: value } });
    };
    const updateSelectedColorByUser = (value: ColorModel) => {
        dispatch({ type: SELECT_COLOR_BY_USER, payload: { color: value } });
    };

    const initializeFiltersOptions = (value: ColorModel[]) => {
        const categories: Map<string, number> = new Map();
        const brands: Map<string, number> = new Map();

        value.map((color: ColorModel) => {
            // initialize the color options filters
            if (color.colorCategory) {
                const category = categories.get(color.colorCategory);
                if (category !== undefined) {
                    categories.set(color.colorCategory, category + 1);
                } else {
                    categories.set(color.colorCategory, 1);
                }
            }
            // initialize the brands filters
            if (color.brand) {
                const brand = brands.get(color.brand);
                if (brand !== undefined) {
                    brands.set(color.brand, brand + 1);
                } else {
                    brands.set(color.brand, 1);
                }
            }
        });

        const initialFilters = colorFilters;

        initialFilters.Color.filterOption = Array.from(categories.entries()).map((value) => {
            return { name: value[0], numberOfItems: value[1], isSelected: false };
        });

        initialFilters.Brands.filterOption = Array.from(brands.entries()).map((value) => {
            return { name: value[0], numberOfItems: value[1], isSelected: false };
        });

        setColorFilters(initialFilters);
    };

    /** Here is all the magic that happens when a filter is selected/deselected. **/
    const updateFiltersOptions = () => {
        // get brands filters
        const brands = colorFilters.Brands;
        // get the color categories filters
        const colorCategories = colorFilters.Color;

        // get the selected brands from filters
        const selectedBrands = brands.filterOption.filter((brand) => brand.isSelected);
        // get the selected color categories from filters
        const selectedColorCategories = colorCategories.filterOption.filter(
            (colorCategory) => colorCategory.isSelected,
        );

        // get all the colors
        let allColors = colors;

        /** This part handle how the color categories filters are updated **/
        // if we have brands selected then we have to update the color categories
        // to match the selected brands
        // get the name of the selected brands
        const selectedBrandsNames: string[] = [];
        selectedBrands.forEach((selectedBrand) => {
            selectedBrandsNames.push(selectedBrand.name);
        });

        // if we have selected brands than filter the colors by selected brands
        if (selectedBrandsNames.length > 0) {
            allColors = allColors.filter((color: ColorModel) => selectedBrandsNames.includes(color.brand));
        }

        // update the color categories filters with the number of colors that match the current selected brands
        colorCategories.filterOption.forEach((colorCategory) => {
            const counter = allColors.filter(
                (color) => color.colorCategory && color.colorCategory === colorCategory.name,
            ).length;
            if (counter === 0) {
                colorCategory.isSelected = false;
            }
            colorCategory.numberOfItems = counter;
        });

        /** This part handle how the brands filters are updated **/
        // if we have color categories selected then we have to update the brands
        // to match the selected color categories
        // refresh the colors
        allColors = colors;
        // get the name of the selected color categories
        const selectedColorCategoriesNames: string[] = [];
        selectedColorCategories.forEach((selectedColorCategory) => {
            selectedColorCategoriesNames.push(selectedColorCategory.name);
        });

        // if we have selected color categories than filter the colors by selected color categories
        if (selectedColorCategoriesNames.length > 0) {
            allColors = allColors.filter((color: ColorModel) =>
                selectedColorCategoriesNames.includes(color.colorCategory),
            );
        }

        // update the brands filters with the number of colors that match the current selected color categories
        brands.filterOption.forEach((brand) => {
            const counter = allColors.filter((color) => color.brand && color.brand === brand.name).length;
            if (counter === 0) {
                brand.isSelected = false;
            }
            brand.numberOfItems = counter;
        });
    };

    const updateColorFilters = (filterOptions: ColorFilters) => {
        setColorFilters(filterOptions);
    };

    const updateFiltersExpandState = (value: boolean) => {
        setFilterExpanded(value);
    };

    return (
        <ColorContext.Provider
            value={{
                colors,
                updateColors,
                filteredColors,
                updateFilteredColors,
                selectedColorState,
                updateSelectedDefaultColor,
                updateSelectedColorByUser,
                colorFilters,
                updateColorFilters,
                isFilterExpanded,
                updateFiltersExpandState,
            }}
        >
            {props.children}
        </ColorContext.Provider>
    );
};
