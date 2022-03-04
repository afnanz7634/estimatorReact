import { CornerRadiusModel } from '@common/models';
import { Reducer } from 'react';

export const SELECT_CORNER_RADIUS_BY_USER = '[CORNER_RADIUS] Select corner radius by user';
export const SELECT_CORNER_RADIUS_BY_DEFAULT = '[CORNER_RADIUS] Select corner radius by default ';

export type SelectedCornerRadiusAction =
    | { type: typeof SELECT_CORNER_RADIUS_BY_USER; payload: { cornerRadius: CornerRadiusModel } }
    | { type: typeof SELECT_CORNER_RADIUS_BY_DEFAULT; payload: { cornerRadius: CornerRadiusModel } };

export type SelectedCornerRadius = {
    cornerRadius: CornerRadiusModel | undefined;
    isSelectedDefault: boolean;
    isSelectedByUser: boolean;
};

export const initialSelectedCornerRadius: SelectedCornerRadius = {
    cornerRadius: undefined,
    isSelectedDefault: true,
    isSelectedByUser: false,
};

export const cornerRadiusReducer: Reducer<SelectedCornerRadius, SelectedCornerRadiusAction> = (
    state: SelectedCornerRadius,
    action: SelectedCornerRadiusAction,
) => {
    switch (action.type) {
        case SELECT_CORNER_RADIUS_BY_DEFAULT:
            return {
                cornerRadius: action.payload.cornerRadius,
                isSelectedDefault: true,
                isSelectedByUser: false,
            };
        case SELECT_CORNER_RADIUS_BY_USER:
            return {
                cornerRadius: action.payload.cornerRadius,
                isSelectedDefault: false,
                isSelectedByUser: true,
            };
        default:
            return initialSelectedCornerRadius;
    }
};
