import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SortBy } from '../colors';

export interface SortByProps {
    sortBy?: SortBy;
    setSortBy: (sortBy: SortBy | undefined) => void;
}

export const SortByPrice = (props: SortByProps) => {
    const { t } = useTranslation();
    const { sortBy, setSortBy } = props;
    const [sortByTitle, setSortByTitle] = useState<string>(t('COMMON.SORT_BY'));

    function onSelectionChange(key: SortBy | undefined) {
        // deselecting
        if (sortBy === Number(key)) {
            setSortBy(undefined);
            key = undefined;
        } else {
            setSortBy(Number(key));
        }

        switch (Number(key)) {
            case SortBy.LowToHigh:
                setSortByTitle(`${t('COMMON.SORT_BY')} : ${t('SCROLLABLE_AREA.COLOR.PRICE_LOW_TO_HIGH')}`);
                break;
            case SortBy.HighToLow:
                setSortByTitle(`${t('COMMON.SORT_BY')} : ${t('SCROLLABLE_AREA.COLOR.PRICE_HIGH_TO_LOW')}`);
                break;
            case SortBy.NameAZ:
                setSortByTitle(`${t('COMMON.SORT_BY')} : ${t('SCROLLABLE_AREA.COLOR.NAME_A_Z')}`);
                break;
            case SortBy.NameZA:
                setSortByTitle(`${t('COMMON.SORT_BY')} : ${t('SCROLLABLE_AREA.COLOR.NAME_Z_A')}`);
                break;
            default:
                setSortByTitle(t('COMMON.SORT_BY'));
        }
    }

    return (
        <Dropdown
            overlay={
                <Menu onClick={(e) => onSelectionChange((e.key as unknown) as SortBy)}>
                    <Menu.Item className={`${sortBy === SortBy.LowToHigh ? 'selected' : ''}`} key={SortBy.LowToHigh}>
                        <span>{t('SCROLLABLE_AREA.COLOR.PRICE_LOW_TO_HIGH')}</span>
                    </Menu.Item>
                    <Menu.Item className={`${sortBy === SortBy.HighToLow ? 'selected' : ''}`} key={SortBy.HighToLow}>
                        {t('SCROLLABLE_AREA.COLOR.PRICE_HIGH_TO_LOW')}
                    </Menu.Item>
                    <Menu.Item className={`${sortBy === SortBy.NameAZ ? 'selected' : ''}`} key={SortBy.NameAZ}>
                        {t('SCROLLABLE_AREA.COLOR.NAME_A_Z')}
                    </Menu.Item>
                    <Menu.Item className={`${sortBy === SortBy.NameZA ? 'selected' : ''}`} key={SortBy.NameZA}>
                        {t('SCROLLABLE_AREA.COLOR.NAME_Z_A')}
                    </Menu.Item>
                </Menu>
            }
        >
            <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
                {sortByTitle} <DownOutlined />
            </a>
        </Dropdown>
    );
};
