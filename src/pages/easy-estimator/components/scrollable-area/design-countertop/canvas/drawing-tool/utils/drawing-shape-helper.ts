import { ArrowInfo, DrawingEdge, DrawingShape } from '@common/models';

export const findDrawingEdgeById = (id: string, shape: DrawingShape): DrawingEdge | undefined => {
    return shape.drawingEdges.find((edge: DrawingEdge) => edge.id === id);
};

export const findArrowByEdgeId = (id: string, shape: DrawingShape): ArrowInfo | undefined => {
    return shape.arrowsInfo?.find((arrow: ArrowInfo) => arrow.drawingEdgeId === id);
};
