import { ColorModel } from '@common/models';
import { Reducer } from 'react';

export const SELECT_COLOR_BY_USER = '[COLOR] Select color by user';
export const SELECT_COLOR_BY_DEFAULT = '[COLOR] Select color by default';

export type SelectedColorAction =
    | { type: typeof SELECT_COLOR_BY_USER; payload: { color: ColorModel } }
    | { type: typeof SELECT_COLOR_BY_DEFAULT; payload: { color: ColorModel } };

export type SelectedColor = {
    color: ColorModel | undefined;
    isSelectedDefault: boolean;
    isSelectedByUser: boolean;
};

export const initialSelectedColor: SelectedColor = {
    color: undefined,
    isSelectedDefault: true,
    isSelectedByUser: false,
};

export const colorReducer: Reducer<SelectedColor, SelectedColorAction> = (
    state: SelectedColor,
    action: SelectedColorAction,
) => {
    switch (action.type) {
        case SELECT_COLOR_BY_DEFAULT:
            return {
                color: action.payload.color,
                isSelectedDefault: true,
                isSelectedByUser: false,
            };
        case SELECT_COLOR_BY_USER:
            return {
                color: action.payload.color,
                isSelectedDefault: false,
                isSelectedByUser: true,
            };
        default:
            return initialSelectedColor;
    }
};
