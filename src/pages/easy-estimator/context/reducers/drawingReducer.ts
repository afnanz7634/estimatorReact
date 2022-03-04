import { Reducer } from 'react';

export const DRAWING_STATE = '[DRAWING] Add shape by adding predefined shape or with free drawing state';

export type DrawingAction = { type: typeof DRAWING_STATE; payload: { drawingState: DrawingState } };

export type DrawingState = {
    isShapeGeneratedState: boolean;
    isFreeDrawingState: boolean;
};

export const initialDrawingState: DrawingState = {
    isShapeGeneratedState: true,
    isFreeDrawingState: false,
};

export const drawingReducer: Reducer<DrawingState, DrawingAction> = (state: DrawingState, action: DrawingAction) => {
    switch (action.type) {
        case DRAWING_STATE:
            return {
                isShapeGeneratedState: action.payload.drawingState.isShapeGeneratedState,
                isFreeDrawingState: action.payload.drawingState.isFreeDrawingState,
            };
        default:
            return initialDrawingState;
    }
};
