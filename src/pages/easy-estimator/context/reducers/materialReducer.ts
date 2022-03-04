import { MaterialModel } from '@common/models';
import { Reducer } from 'react';

export const SELECT_MATERIAL_BY_USER = '[MATERIAL] Select material by user';
export const SELECT_MATERIAL_BY_DEFAULT = '[MATERIAL] Select material by default ';

export type SelectedMaterialAction =
    | { type: typeof SELECT_MATERIAL_BY_USER; payload: { material: MaterialModel } }
    | { type: typeof SELECT_MATERIAL_BY_DEFAULT; payload: { material: MaterialModel } };

export type SelectedMaterial = {
    material: MaterialModel | undefined;
    isSelectedDefault: boolean;
    isSelectedByUser: boolean;
};

export const initialSelectedMaterial: SelectedMaterial = {
    material: undefined,
    isSelectedDefault: true,
    isSelectedByUser: false,
};

export const materialReducer: Reducer<SelectedMaterial, SelectedMaterialAction> = (
    state: SelectedMaterial,
    action: SelectedMaterialAction,
) => {
    switch (action.type) {
        case SELECT_MATERIAL_BY_DEFAULT:
            return {
                material: action.payload.material,
                isSelectedDefault: true,
                isSelectedByUser: false,
            };
        case SELECT_MATERIAL_BY_USER:
            return {
                material: action.payload.material,
                isSelectedDefault: false,
                isSelectedByUser: true,
            };
        default:
            return initialSelectedMaterial;
    }
};
