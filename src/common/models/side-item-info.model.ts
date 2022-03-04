import { SideItemType } from '@common/enums';
import { ArrowInfo } from './drawing-shape.model';

export interface SideItemInfoModel {
    id: number;
    label: string;
    value: string;
    sideType: SideItemType;
    arrowInfo: ArrowInfo;
    checked: boolean;
    backsplash?: BacksplashInfoModel;
}

export interface BacksplashInfoModel {
    checked: boolean;
    value?: number;
}
