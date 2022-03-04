import { createContext, useReducer, useState } from 'react';
import { PredefinedThicknessOption } from '@common/models/predefined-thickness-option.model';
import {
    initialSelectedThickness,
    SELECT_THICKNESS_BY_DEFAULT,
    SELECT_THICKNESS_BY_USER,
    thicknessReducer,
} from '@ee-reducer';

export const ThicknessContext = createContext<any>({});

export const ThicknessContextProvider = (props: any) => {
    const [thicknessOptions, setThicknessOptions] = useState<PredefinedThicknessOption[]>([]);
    const [selectedThicknessOption, dispatch] = useReducer(thicknessReducer, initialSelectedThickness);

    const updateThicknessOptions = (value: PredefinedThicknessOption[]) => {
        setThicknessOptions(value);
    };

    const updateSelectedDefaultThickness = (value: PredefinedThicknessOption) => {
        dispatch({ type: SELECT_THICKNESS_BY_DEFAULT, payload: { thickness: value } });
    };
    const updateSelectedThicknessByUser = (value: PredefinedThicknessOption) => {
        dispatch({ type: SELECT_THICKNESS_BY_USER, payload: { thickness: value } });
    };

    return (
        <ThicknessContext.Provider
            value={{
                thicknessOptions,
                updateThicknessOptions,
                selectedThicknessOption,
                updateSelectedDefaultThickness,
                updateSelectedThicknessByUser
            }}
        >
            {props.children}
        </ThicknessContext.Provider>
    );
};
