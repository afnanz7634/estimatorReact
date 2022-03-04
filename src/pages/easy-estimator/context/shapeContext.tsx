import { PredefinedShape, SideItemInfoModel } from '@common/models';
import { drawingReducer, DrawingState, DRAWING_STATE, initialDrawingState } from '@ee-reducer';
import { createContext, useReducer, useState } from 'react';

export const ShapeContext = createContext<any>({});

export const ShapeContextProvider = (props: any) => {
    const [shapes, setShapes] = useState<PredefinedShape[]>([]);
    const [selectedShape, setSelectedShape] = useState<PredefinedShape>();
    const [selectedSideItem, setSelectedSideItem] = useState<SideItemInfoModel>();
    const [shapesSideItems, setShapesSideItems] = useState<{
        [key: string]: { [key: string]: Array<SideItemInfoModel> };
    }>({});
    const [isVisibleShapeTab, setIsVisibleShapeTab] = useState(false);
    const [drawingState, dispatch] = useReducer(drawingReducer, initialDrawingState);

    const updateShapes = (value: PredefinedShape[]) => {
        setShapes(value);
    };
    const updateSelectedSideItem = (value: SideItemInfoModel) => {
        setSelectedSideItem(value);
    };

    const updateShapesSideItems = (shapesSideItems: { [key: string]: { [key: string]: Array<SideItemInfoModel> } }) => {
        setShapesSideItems(shapesSideItems);
    };

    const updateSelectedShape = (value: PredefinedShape) => {
        setSelectedShape(value);
    };

    const updateDrawingStatus = (value: DrawingState) => {
        dispatch({ type: DRAWING_STATE, payload: { drawingState: value } });
    };

    const updateIsVisibleShapeTabStatus = (value: boolean) => {
        setIsVisibleShapeTab(value);
    };

    return (
        <ShapeContext.Provider
            value={{
                shapes,
                updateShapes,
                selectedShape,
                updateSelectedShape,
                selectedSideItem,
                updateSelectedSideItem,
                shapesSideItems,
                updateShapesSideItems,
                drawingState,
                updateDrawingStatus,
                isVisibleShapeTab,
                updateIsVisibleShapeTabStatus,
            }}
        >
            {props.children}
        </ShapeContext.Provider>
    );
};
