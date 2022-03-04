import { DrawingShape } from '@common/models';
import { createContext, useState } from 'react';

export const DrawingShapeContext = createContext<any>({});

export const DrawingShapeContextProvider = (props: any) => {
    const [drawingShapes, setDrawingShapes] = useState<DrawingShape[]>([]);
    const [activeDrawingShape, setActiveDrawingShape] = useState<DrawingShape>();
    const [needRedrawCanvas, setRedrawCanvas] = useState<boolean>(false);

    const updateDrawingShapes = (value: DrawingShape[]) => {
        setDrawingShapes(value);
    };

    const updateActiveDrawingShape = (value: DrawingShape) => {
        setActiveDrawingShape(value);
    };

    const updateRedrawCanvasFlag = (value: boolean) => {
        setRedrawCanvas(value);
    };

    return (
        <DrawingShapeContext.Provider
            value={{
                drawingShapes,
                updateDrawingShapes,
                activeDrawingShape,
                updateActiveDrawingShape,
                needRedrawCanvas,
                updateRedrawCanvasFlag,
            }}
        >
            {props.children}
        </DrawingShapeContext.Provider>
    );
};
