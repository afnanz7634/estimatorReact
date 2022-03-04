import { createContext, useState } from 'react';
import { PredefinedCustomSide } from '@common/models/predefined-custom-side.model';

export const CustomSideContext = createContext<any>({});

export const CustomSideContextProvider = (props: any) => {
    const [customSides, setCustomSides] = useState<PredefinedCustomSide[]>([]);
    const [selectedCustomSide, setSelectedCustomSide] = useState<PredefinedCustomSide>();

    const updateCustomSides = (value: PredefinedCustomSide[]) => {
        setCustomSides(value);
    };

    const updateSelectedCustomSide = (value: PredefinedCustomSide) => {
        setSelectedCustomSide(value);
    };

    return (
        <CustomSideContext.Provider
            value={{
                customSides,
                updateCustomSides,
                selectedCustomSide,
                updateSelectedCustomSide,
            }}
        >
            {props.children}
        </CustomSideContext.Provider>
    );
};
