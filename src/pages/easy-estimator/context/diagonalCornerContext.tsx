import { createContext, useState } from 'react';
import { DiagonalCornerModel } from '@common/models';

export const DiagonalCornerContext = createContext<any>({});

export const DiagonalCornerContextProvider = (props: any) => {
    const [diagonalCorners, setDiagonalCorners] = useState<DiagonalCornerModel[]>([]);
    const [selectedDiagonalCorner, setSelectedDiagonalCorner] = useState<DiagonalCornerModel>();

    const updateDiagonalCorners = (value: DiagonalCornerModel[]) => {
        setDiagonalCorners(value);
    };

    const updateSelectedDiagonalCorner = (value: DiagonalCornerModel) => {
        setSelectedDiagonalCorner(value);
    };

    return (
        <DiagonalCornerContext.Provider
            value={{
                diagonalCorners,
                updateDiagonalCorners,
                selectedDiagonalCorner,
                updateSelectedDiagonalCorner,
            }}
        >
            {props.children}
        </DiagonalCornerContext.Provider>
    );
};
