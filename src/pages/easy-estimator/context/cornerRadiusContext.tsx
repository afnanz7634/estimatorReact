import { CornerRadiusModel } from '@common/models';
import { createContext, useReducer, useState } from 'react';
import {
    cornerRadiusReducer,
    initialSelectedCornerRadius,
    SELECT_CORNER_RADIUS_BY_DEFAULT,
    SELECT_CORNER_RADIUS_BY_USER,
} from './reducers/cornerRadiusReducer';

export const CornerRadiusContext = createContext<any>({});

export const CornerRadiusContextProvider = (props: any) => {
    const [cornerRadii, setCornerRadii] = useState<CornerRadiusModel[]>([]);
    const [selectedCornerRadiusOnCardState, dispatch] = useReducer(cornerRadiusReducer, initialSelectedCornerRadius);

    const updateCornerRadii = (value: CornerRadiusModel[]) => {
        setCornerRadii(value);
    };

    const updateSelectedCornerRadiusByDefault = (value: CornerRadiusModel) => {
        dispatch({ type: SELECT_CORNER_RADIUS_BY_DEFAULT, payload: { cornerRadius: value } });
    };
    const updateSelectedCornerRadiusByUser = (value: CornerRadiusModel) => {
        dispatch({ type: SELECT_CORNER_RADIUS_BY_USER, payload: { cornerRadius: value } });
    };

    return (
        <CornerRadiusContext.Provider
            value={{
                cornerRadii,
                updateCornerRadii,
                selectedCornerRadiusOnCardState,
                updateSelectedCornerRadiusByDefault,
                updateSelectedCornerRadiusByUser,
            }}
        >
            {props.children}
        </CornerRadiusContext.Provider>
    );
};
