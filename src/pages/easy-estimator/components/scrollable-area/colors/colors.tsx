import { ColorModel } from '@common/models';
import { setDefaultSrc } from '@common/utils';
import { CardItem, Filters } from '@core/components';
import { Spin } from 'antd';
import { orderBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import './colors.scss';
import { SortByPrice } from './components/sort-by-price';
import { ThicknessOptions } from './components/thickness/thickness-options';
import useColors from './useColors';
import { useContext } from 'react';
import useFilters from './color-filters';
import { ColorContext } from '@ee-context';

export enum SortBy {
    HighToLow,
    LowToHigh,
    NameAZ,
    NameZA,
}

export interface ColorItemProps {
    id: number;
    color: ColorModel;
}
export interface ColorProps {
    step: number;
    stepInfo: string;
}

export function Colors(props: ColorProps) {
    const { t } = useTranslation();
    const { stepInfo, step } = props;

    const {
        sortBy,
        selectedStore,
        zipcode,
        colors,
        setSortBy,
        loading,
        filteredColors,
        selectedColor,
        updateSelectedColorByUser,
    } = useColors();

    const { colorFilters, updateColorFilters, isFilterExpanded, updateFiltersExpandState } = useContext(ColorContext);

    useFilters();

    // sorting
    const sortColors = (colors: Array<ColorModel>): Array<ColorModel> => {
        switch (sortBy) {
            case SortBy.HighToLow:
                return orderBy(colors, ['price'], ['desc']);
            case SortBy.LowToHigh:
                return orderBy(colors, ['price'], ['asc']);
            case SortBy.NameAZ:
                return orderBy(colors, ['name'], ['asc']);
            case SortBy.NameZA:
                return orderBy(colors, ['name'], ['desc']);
            default:
                return orderBy(colors, ['name'], ['asc']);
        }
    };

    const selectManualColor = (color: ColorModel) => {
        updateSelectedColorByUser(color);
    };

    const ColorItem = (props: ColorItemProps) => {
        const { color } = props;
        return (
            <div className="image-container">
                <div
                    className={`image-card ${
                        selectedColor?.productId === color?.productId || selectedColor?.name === color?.name
                            ? 'selected'
                            : ''
                    }`}
                    onClick={() => selectManualColor(color)}
                >
                    <img alt="color" src={color.swatchImageUrl} onError={setDefaultSrc} />
                    <div className="card-name">
                        <div className="color-name">{color.name}</div>
                        {zipcode && <div className="color-price">${color.price} sq ft</div>}
                    </div>
                </div>
            </div>
        );
    };

    if (selectedStore || !zipcode) {
        return (
            <CardItem
                title={t('SCROLLABLE_AREA.COLOR.TITLE')}
                id={step}
                stepInfo={stepInfo}
                description={t('SCROLLABLE_AREA.COLOR.DESCRIPTION')}
                extra={zipcode && colors && colors.length > 0 && <SortByPrice setSortBy={setSortBy} sortBy={sortBy} />}
                infoIcon={{
                    title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                    content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
                }}
            >
                <>
                    {colors && !loading && (
                        <div className={`color-card-wrapper ${isFilterExpanded ? 'row-direction' : ''}`}>
                            <Filters
                                isFilterExpanded={isFilterExpanded}
                                setFilterExpanded={updateFiltersExpandState}
                                filterOptions={{ ...colorFilters }}
                                updateFilters={updateColorFilters}
                            />
                            <div className="color-card-content">
                                {sortColors(filteredColors).map((color: ColorModel, id: number) => (
                                    <ColorItem key={id} id={id} color={color} />
                                ))}
                            </div>
                            {selectedColor?.thicknessOptions.length > 1 && <ThicknessOptions />}
                        </div>
                    )}
                    {loading && <Spin style={{ fontSize: 24 }} />}
                </>
            </CardItem>
        );
    } else {
        return (
            <CardItem
                id={step}
                infoIcon={{
                    title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                    content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
                }}
                stepInfo={stepInfo}
                title={t('SCROLLABLE_AREA.COLOR.TITLE')}
                description={t('SCROLLABLE_AREA.COLOR.SELECT_MATERIAL')}
            />
        );
    }
}
export default Colors;
