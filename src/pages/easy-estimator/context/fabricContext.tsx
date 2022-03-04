import { Skeleton } from '@common/models';
import { fabric } from 'fabric';
import React, { createContext, useCallback, useState } from 'react';

export const FabricContext = createContext<any>({});

export const FabricContextProvider = (props: { children: JSX.Element }): JSX.Element => {
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [activeFreeDrawing, setActiveDrawing] = useState<Skeleton>();
    const [freeDrawMode, setFreeDrawMode] = useState(false);

    const initCanvas = useCallback((el: any) => {
        const canvasOptions = {
            preserveObjectStacking: false,
            selection: true,
            defaultCursor: 'default',
        };
        let c = new fabric.Canvas(el, canvasOptions);
        c.setZoom(4);
        c.renderAll();
        setCanvas(c);
    }, []);

    const updateActiveFreeDrawing = (drawing: Skeleton) => {
        setActiveDrawing(drawing);
    };

    const updateFreeDrawMode = (state: boolean) => {
        setFreeDrawMode(state);
    };

    return (
        <FabricContext.Provider
            value={{
                canvas,
                initCanvas,
                activeFreeDrawing,
                updateActiveFreeDrawing,
                freeDrawMode,
                updateFreeDrawMode
            }}
        >
            {props.children}
        </FabricContext.Provider>
    );
};
