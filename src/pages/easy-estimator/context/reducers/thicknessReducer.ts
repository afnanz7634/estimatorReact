import { Reducer } from 'react';
import {PredefinedThicknessOption} from "@common/models/predefined-thickness-option.model";

export const SELECT_THICKNESS_BY_USER = '[THICKNESS] Select material by user';
export const SELECT_THICKNESS_BY_DEFAULT = '[THICKNESS] Select material by default ';

export type SelectedThicknessAction =
    | { type: typeof SELECT_THICKNESS_BY_USER; payload: { thickness: PredefinedThicknessOption } }
    | { type: typeof SELECT_THICKNESS_BY_DEFAULT; payload: { thickness: PredefinedThicknessOption } };

export type SelectedThickness = {
    thickness: PredefinedThicknessOption | undefined;
    isSelectedDefault: boolean;
    isSelectedByUser: boolean;
};

export const initialSelectedThickness: SelectedThickness = {
    thickness: undefined,
    isSelectedDefault: true,
    isSelectedByUser: false,
};

export const thicknessReducer: Reducer<SelectedThickness, SelectedThicknessAction> = (
    state: SelectedThickness,
    action: SelectedThicknessAction,
) => {
    switch (action.type) {
        case SELECT_THICKNESS_BY_USER:
            return {
                thickness: action.payload.thickness,
                isSelectedDefault: false,
                isSelectedByUser: true,
            };
        case SELECT_THICKNESS_BY_DEFAULT:
            return {
                thickness: action.payload.thickness,
                isSelectedDefault: true,
                isSelectedByUser: false,
            };
        default:
            return initialSelectedThickness;
    }
};
