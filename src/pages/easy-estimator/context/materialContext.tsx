import { MaterialModel } from '@common/models';
import {
    initialSelectedMaterial,
    materialReducer,
    SELECT_MATERIAL_BY_DEFAULT,
    SELECT_MATERIAL_BY_USER,
} from '@ee-reducer';
import { createContext, useReducer, useState } from 'react';

export const MaterialContext = createContext<any>({});

export const MaterialContextProvider = (props: any) => {
    const [materials, setMaterials] = useState<MaterialModel[] | undefined>([]);
    const [loadedMaterial, setLoadedMaterial] = useState(false);
    const [selectedMaterialState, dispatch] = useReducer(materialReducer, initialSelectedMaterial);

    const updateMaterials = (value: MaterialModel[] | undefined) => {
        setMaterials(value);
    };

    const updateLoadedMaterial = (value: boolean) => {
        setLoadedMaterial(value);
    };

    const updateSelectedDefaultMaterial = (value: MaterialModel) => {
        dispatch({ type: SELECT_MATERIAL_BY_DEFAULT, payload: { material: value } });
    };
    const updateSelectedMaterialByUser = (value: MaterialModel) => {
        dispatch({ type: SELECT_MATERIAL_BY_USER, payload: { material: value } });
    };

    return (
        <MaterialContext.Provider
            value={{
                materials,
                updateMaterials,
                selectedMaterialState,
                loadedMaterial,
                updateSelectedDefaultMaterial,
                updateSelectedMaterialByUser,
                updateLoadedMaterial,
            }}
        >
            {props.children}
        </MaterialContext.Provider>
    );
};
