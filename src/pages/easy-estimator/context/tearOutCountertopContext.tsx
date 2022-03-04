import { createContext, useState } from 'react';
import { TearOutCountertopModel } from '@common/models';

export const TearOutCountertopContext = createContext<any>({});

export const TearOutCountertopContextProvider = (props: any) => {
    const [tearOuts, setTearOuts] = useState<TearOutCountertopModel[]>([]);
    const [selectedTearOut, setSelectedTearOut] = useState<Map<TearOutCountertopModel, number>>(new Map());

    const updateTearOuts = (tearOuts: TearOutCountertopModel[]) => {
        setTearOuts(tearOuts);
    };

    const updateSelectedTearOut = (tearOut: Map<TearOutCountertopModel, number>) => {
        setSelectedTearOut(tearOut);
    };

    return (
        <TearOutCountertopContext.Provider
            value={{
                tearOuts,
                updateTearOuts,
                selectedTearOut,
                updateSelectedTearOut,
            }}
        >
            {props.children}
        </TearOutCountertopContext.Provider>
    );
};
