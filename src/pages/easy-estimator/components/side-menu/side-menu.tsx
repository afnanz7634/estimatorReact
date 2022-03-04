import { useTranslation } from 'react-i18next';
import './side-menu.scss';

export interface SideMenuProps {
    active: string;
    setActive: (link: string) => void;
    onMenuLinkClick?: (clickedValue: string) => void;
}

export function SideMenu(props: SideMenuProps) {
    const { t } = useTranslation();
    const { active, setActive } = props;

    return (
        <div className="navigation-menu">
            <div
                onClick={() => {
                    setActive('information');
                }}
                className={`${active === 'information' ? 'isActive' : ''}`}
            >
                {t('NAVIGATION_MENU.INFORMATION')}
            </div>
            <div
                onClick={() => {
                    setActive('material');
                }}
                className={`${active === 'material' ? 'isActive' : ''}`}
            >
                {t('NAVIGATION_MENU.MATERIAL')}
            </div>
            <div
                className={`${active === 'color' ? 'isActive' : ''}`}
                onClick={() => {
                    setActive('color');
                }}
            >
                {t('NAVIGATION_MENU.COLOR')}
            </div>
            <div
                onClick={() => {
                    setActive('countertop');
                }}
                className={`${active === 'countertop' ? 'isActive' : ''}`}
            >
                {t('NAVIGATION_MENU.DEFINE_COUNTERTOP')}
            </div>
        </div>
    );
}

export default SideMenu;
