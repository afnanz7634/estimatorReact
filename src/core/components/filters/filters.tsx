import React, { ReactElement } from 'react';
import { Button, Checkbox, Divider } from 'antd';
import './filter.scss';
import { UpOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import Sider from 'antd/lib/layout/Sider';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useTranslation } from 'react-i18next';
import { Filter, FilterOption } from '@common/models';

export interface FiltersProps<T> {
    isFilterExpanded: boolean;
    setFilterExpanded: (value: boolean) => void;
    filterOptions: T;
    updateFilters: (filters: T) => void;
}

/**
 * Represents the ui filters component.
 * The component will work as much as the provided generic type T will be Record<StringKeys,Filter>.
 * Basically the T object is an object similar to a Map. The 'StringKeys' are the headlines for the filters sections
 * and the Filter it's an object containing all the needed information about a filter section.
 * @param props
 */
export function Filters<T>(props: FiltersProps<T>): ReactElement {
    const { isFilterExpanded, setFilterExpanded, filterOptions, updateFilters } = props;
    const { t } = useTranslation();

    const expandFilters = (value: boolean) => {
        setFilterExpanded(value);
    };

    const clearFilters = () => {
        Array.from(Object.values(filterOptions)).forEach((filter) => {
            filter?.filterOption.forEach((filterOption: FilterOption) => {
                if (filterOption.isSelected) {
                    filterOption.isSelected = false;
                }
            });
        });

        updateFilters(filterOptions);
    };

    const selectFilter = (e: CheckboxChangeEvent) => {
        Array.from(Object.values(filterOptions)).forEach((filter) => {
            filter?.filterOption.forEach((filterOption: FilterOption) => {
                if (filterOption.name === e.target.value) {
                    filterOption.isSelected = !filterOption.isSelected;
                }
            });
        });

        updateFilters(filterOptions);
    };

    const handleFilterSection = (key: keyof T) => {
        // the T type should be always a Record of <key,Filter>
        const section = filterOptions[key] as unknown as Filter;
        if (section) {
            section.isExpanded = !section.isExpanded;
            updateFilters(filterOptions);
        }
    };

    const FiltersSection = (props: { headline: keyof T; filters: Filter }) => {
        return (
            <>
                <div className="section-headline">
                    {props.headline}
                    <Arrow isExpanded={props.filters.isExpanded} sectionKey={props.headline} />
                </div>
                {props.filters.isExpanded && (
                    <>
                        <Divider />
                        <div className="filter-options">
                            {props.filters.filterOption.map((filterOption, index) => (
                                <Checkbox
                                    key={index}
                                    value={filterOption.name}
                                    onChange={selectFilter}
                                    checked={filterOption.isSelected}
                                    className={`${filterOption.numberOfItems === 0 ? 'hide' : ''}`}
                                >
                                    {filterOption.name}
                                    <div className="counts">{`(${filterOption.numberOfItems})`}</div>
                                </Checkbox>
                            ))}
                        </div>
                    </>
                )}
            </>
        );
    };

    const ExpandFilters = () => (
        <div className="expand-arrow">
            <RightOutlined />
        </div>
    );

    const ClearFilters = () => {
        return (
            <Button className="clear-filters-btn" onClick={clearFilters}>
                {t('COMMON.CLEAR_FILTERS')}
            </Button>
        );
    };

    const FiltersButton = () => {
        return (
            <Button className="apply-filters-btn" onClick={() => expandFilters(true)}>
                {t('COMMON.APPLY_FILTERS')}
                <ExpandFilters />
            </Button>
        );
    };

    const Arrow = (props: { isExpanded: boolean; sectionKey: keyof T }) => {
        return (
            <div className="expand-collapse-arrow" onClick={() => handleFilterSection(props.sectionKey)}>
                {!props.isExpanded ? <UpOutlined rotate={180} /> : <UpOutlined />}
            </div>
        );
    };

    const FilterOptions = () => {
        return (
            <Sider
                className="filters "
                onCollapse={() => expandFilters(false)}
                theme="light"
                breakpoint="sm"
                width={250}
                collapsedWidth={0}
                collapsible
                trigger={<LeftOutlined />}
            >
                <ClearFilters />
                {Array.from(Object.entries(filterOptions)).map((value: [string, Filter], index) => (
                    <div className="filters-section" key={index}>
                        <FiltersSection key={index} headline={value[0] as keyof T} filters={value[1]} />
                    </div>
                ))}
            </Sider>
        );
    };

    return <>{isFilterExpanded ? <FilterOptions /> : <FiltersButton />}</>;
}

export default Filters;
