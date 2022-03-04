import { CANVAS_OBJECT_TYPE_PREFIX } from '@common/constants';
import { SideItemType } from '@common/enums';
import {
    ArrowInfo,
    Backsplash,
    DrawingEdge,
    DrawingShape,
    RemovedEdgeAndCorners,
    SideItemInfoModel
} from '@common/models';
import { DrawingShapeContext, FabricContext, PriceContext, ShapeContext } from '@ee-context';
import { getBacksplashArea } from 'pages/easy-estimator/components/price/utils/area-helper';
import { useContext, useEffect } from 'react';
import drawingTool from '../drawer/drawingTool';

const useSideItems = (): void => {
    const { canvas } = useContext(FabricContext);
    const { selectedSideItem } = useContext(ShapeContext);
    const { drawingShapes, updateDrawingShapes, updateRedrawCanvasFlag } = useContext(DrawingShapeContext);
    const { updateBacksplashArea } = useContext(PriceContext);

    const createEdgesAndCornersObject = (
        selectedEdge: DrawingEdge,
        shape: DrawingShape,
        sideItem: SideItemInfoModel,
    ) => {
        const cornerRadiiInfo = Object.values({ ...shape.cornerMap });
        // EE-968 ensure corners are sorted by filtering each individually (helps with backsplash arrow display)
        const appliedCornersByEdge = [
            ...cornerRadiiInfo.filter((cornerRadiusInfo) => cornerRadiusInfo.id === selectedEdge.startCornerId),
            ...cornerRadiiInfo.filter((cornerRadiusInfo) => cornerRadiusInfo.id === selectedEdge.endCornerId),
        ];

        const arrowInfoBySelectedEdge = shape?.arrowsInfo?.find(
            (arrowInfo) => arrowInfo.drawingEdgeId === selectedEdge.id,
        );

        const removedEdgesAndCorners: RemovedEdgeAndCorners = {
            sideItemType: sideItem.sideType,
            drawingEdge: selectedEdge,
            arrowInfo: arrowInfoBySelectedEdge ? arrowInfoBySelectedEdge : null,
            appliedCorners: appliedCornersByEdge,
        };

        return removedEdgesAndCorners;
    };

    const removeEdgeAndCorners = (
        edgesAndCorners: RemovedEdgeAndCorners[],
        currentEdgeAndCorners: RemovedEdgeAndCorners,
    ): void => {
        if (!edgesAndCorners.length || !currentEdgeAndCorners) return;

        const foundIndex = edgesAndCorners?.findIndex(
            (removedEdgeAndCorners) =>
                removedEdgeAndCorners.drawingEdge.id === currentEdgeAndCorners.drawingEdge.id &&
                removedEdgeAndCorners.sideItemType !== currentEdgeAndCorners.sideItemType,
        );
        if (foundIndex > -1) edgesAndCorners.splice(foundIndex, 1);
    };

    const removeElementsBySideItem = (sideItem: SideItemInfoModel) => {
        const dShapes = drawingShapes.map((drawingShape: DrawingShape) => {
            const selectedEdge = drawingShape?.drawingEdges?.find(
                (drawingEdge: DrawingEdge) => drawingEdge?.id === sideItem?.arrowInfo?.drawingEdgeId,
            );

            if (selectedEdge) {
                // remove edges and corners on drawingShape structure and keep history of deleted items
                const edgeAndCorners = createEdgesAndCornersObject(selectedEdge, drawingShape, sideItem);
                drawingShape?.removedElementsHistory?.edgesAndCorners.push(edgeAndCorners);

                // reduce the history removed edges and corners array in having one appliance side per each edge
                removeEdgeAndCorners(drawingShape?.removedElementsHistory?.edgesAndCorners || [], edgeAndCorners);

                updateEdgeAndCornersListStructureAfterRemovalAction(selectedEdge, drawingShape);
            }

            return drawingShape;
        });

        updateDrawingShapes([...dShapes]);
        updateRedrawCanvasFlag(true);
    };

    const updateEdgeAndCornersListStructureAfterRemovalAction = (selectedEdge: DrawingEdge, shape: DrawingShape) => {
        // update cornerRadii list with selectedEdge info
        const cornerRadiiInfo = Object.values({ ...shape?.cornerMap });
        if (shape?.removedElementsHistory && shape?.removedElementsHistory?.edgesAndCorners?.length === 0) return;
        cornerRadiiInfo.forEach((cornerRadiusInfo) => {
            if (
                cornerRadiusInfo.id === selectedEdge.startCornerId ||
                cornerRadiusInfo.id === selectedEdge.endCornerId
            ) {
                cornerRadiusInfo.isVisibleInCanvas = false;
            }
        });

        // remove drawingEdgeId from arrowInfo  for Area calculation and marked drawingEdge as not visible in canvas
        const arrowInfoWithEdge = shape?.arrowsInfo?.find((arrowInfo) => arrowInfo?.drawingEdgeId === selectedEdge?.id);

        if (!arrowInfoWithEdge) return;

        arrowInfoWithEdge.iActiveForEdgeCalc = false;
        selectedEdge.isVisibleInCanvas = false;

        // remove backsplash information from DrawingShape object in case a backsplash has been selected previously
        if (selectedEdge.backsplash.depth > 0) {
            selectedEdge.backsplash = { depth: 0, arrowsInfo: [] };
            arrowInfoWithEdge.isVisibleInCanvas = true;
        }
    };

    const updateEdgeAndCornersListStructureAfterUndoneAction = (
        shape: DrawingShape,
        removedEdgeAndCornerInfo: RemovedEdgeAndCorners,
    ) => {
        // reset the is visible flag from drawingEdge and ArrowInfo
        shape?.arrowsInfo?.forEach((arrowInfo) => {
            if (arrowInfo?.drawingEdgeId === removedEdgeAndCornerInfo?.arrowInfo?.drawingEdgeId) {
                arrowInfo.iActiveForEdgeCalc = true;
                arrowInfo.isVisibleInCanvas = true;
            }
        });

        shape?.drawingEdges?.forEach((drawingEdge) => {
            if (drawingEdge.id === removedEdgeAndCornerInfo.drawingEdge?.id) {
                drawingEdge.isVisibleInCanvas = true;

                // if there is backsplash information when uncheck wall side, reset it
                if (drawingEdge?.backsplash?.depth > 0) {
                    drawingEdge.backsplash = { depth: 0, arrowsInfo: [] };
                }
            }
        });

        // make cornerRadii applicable again by setting isVisibleInCanvas flag to true
        const cornerRadiiInfo = Object.values(shape.cornerMap);

        cornerRadiiInfo.forEach((cornerInfo, index) => {
            const appliedCorner = removedEdgeAndCornerInfo.appliedCorners.find((el) => el.id === cornerInfo.id);
            if (
                appliedCorner &&
                shape.drawingEdges.find((el) => el.startCornerId === appliedCorner.id)?.isVisibleInCanvas &&
                shape.drawingEdges.find((el) => el.endCornerId === appliedCorner.id)?.isVisibleInCanvas
            ) {
                cornerInfo.isVisibleInCanvas = true;
                drawingTool.addCornerRadiusMeasureText(canvas, shape, index, cornerInfo);
            } else if (appliedCorner) {
                cornerInfo.isVisibleInCanvas = false;
            }
        });

        // remove undone Edges and Corners info from removedElementsHistory object
        if (shape.removedElementsHistory) {
            const removedEdgesAndCornersIndex = shape.removedElementsHistory.edgesAndCorners.findIndex(
                (edgeAndCorners: RemovedEdgeAndCorners) =>
                    edgeAndCorners.arrowInfo?.drawingEdgeId === selectedSideItem.arrowInfo?.drawingEdgeId,
            );

            if (removedEdgesAndCornersIndex > -1) {
                shape.removedElementsHistory?.edgesAndCorners.splice(removedEdgesAndCornersIndex, 1);
            }
        }
    };

    const undoRemovedElementsBySideItem = (sideItem: SideItemInfoModel) => {
        const dShapes = drawingShapes.map((drawingShape: DrawingShape) => {
            // undo changes on DrawingShape structure
            const removedEdgeAndCornerInfo = drawingShape?.removedElementsHistory?.edgesAndCorners.find(
                (edgeAndCorners: RemovedEdgeAndCorners) =>
                    edgeAndCorners.arrowInfo?.drawingEdgeId === sideItem?.arrowInfo?.drawingEdgeId,
            );

            if (removedEdgeAndCornerInfo) {
                updateEdgeAndCornersListStructureAfterUndoneAction(drawingShape, removedEdgeAndCornerInfo);
            }

            return drawingShape;
        });

        updateDrawingShapes([...dShapes]);
        updateRedrawCanvasFlag(true);
    };

    const findEdgeAndArrowBySelectedSideItem = (
        shape: DrawingShape,
    ): { foundDrawingEdge: DrawingEdge | undefined; foundArrowInfo: ArrowInfo | undefined } => {
        const foundDrawingEdge = shape?.drawingEdges.find(
            (drawingEdge) => drawingEdge?.id === selectedSideItem?.arrowInfo?.drawingEdgeId,
        );

        const foundArrowInfo = shape?.arrowsInfo?.find(
            (arrowInfo) => arrowInfo?.drawingEdgeId === selectedSideItem?.arrowInfo?.drawingEdgeId,
        );

        return {
            foundDrawingEdge,
            foundArrowInfo,
        };
    };

    const addBacksplash = () => {
        updateRedrawCanvasFlag(false);

        const dShapes = drawingShapes.map((shape: DrawingShape) => {
            const { foundDrawingEdge, foundArrowInfo } = findEdgeAndArrowBySelectedSideItem(shape);

            if (foundDrawingEdge && foundArrowInfo) {
                foundArrowInfo.isVisibleInCanvas = false;
                foundDrawingEdge.backsplash.depth = selectedSideItem.backsplash.value;
            }

            return shape;
        });

        updateDrawingShapes([...dShapes]);
        updateRedrawCanvasFlag(true);
    };

    const removeBacksplash = () => {
        const dShapes = drawingShapes.map((shape: DrawingShape) => {
            const { foundDrawingEdge, foundArrowInfo } = findEdgeAndArrowBySelectedSideItem(shape);
            if (foundDrawingEdge && foundArrowInfo) {
                // remove backsplash information from DrawingShape object
                foundDrawingEdge.backsplash.depth = 0;
                if (foundDrawingEdge.backsplash.arrowsInfo) {
                    // explicitly remove the array entries, otherwise they are still used from other references
                    foundDrawingEdge.backsplash.arrowsInfo.splice(0, foundDrawingEdge.backsplash.arrowsInfo.length);
                }

                foundArrowInfo.isVisibleInCanvas = true;
            }

            return shape;
        });
        updateDrawingShapes([...dShapes]);
        updateRedrawCanvasFlag(true);
    };

    // on side type select
    useEffect(() => {
        if (selectedSideItem?.checked) {
            switch (selectedSideItem?.sideType) {
                case SideItemType.WALL_SIDE:
                    //  remove wall side and add or remove backsplash item
                    if (selectedSideItem?.backsplash?.checked) {
                        addBacksplash();
                    } else {
                        selectedSideItem?.backsplash?.value > 0
                            ? removeBacksplash()
                            : removeElementsBySideItem(selectedSideItem);
                    }

                    break;
                case SideItemType.APPLIANCE_SIDE:
                    removeElementsBySideItem(selectedSideItem);
                    break;
                case SideItemType.WATERFALL:
                    break;

                default:
                    break;
            }
        } else {
            switch (selectedSideItem?.sideType) {
                case SideItemType.WALL_SIDE:
                    undoRemovedElementsBySideItem(selectedSideItem);

                    break;
                case SideItemType.APPLIANCE_SIDE:
                    undoRemovedElementsBySideItem(selectedSideItem);
                    break;
                case SideItemType.WATERFALL:
                    break;

                default:
                    break;
            }
        }
    }, [selectedSideItem, selectedSideItem?.checked, selectedSideItem?.backsplash?.checked]);

    useEffect(() => {
        let backSplashArea = 0.0;
        drawingShapes.forEach((shape: DrawingShape) => {
            // calculate backsplash area
            shape?.drawingEdges
                .filter(
                    (drawingEdge) =>
                        drawingEdge?.backsplash?.arrowsInfo && drawingEdge?.backsplash?.arrowsInfo?.length > 0,
                )
                .map((edge) => {
                    backSplashArea += getBacksplashArea(edge.backsplash);
                });
        });
        updateBacksplashArea(backSplashArea);
    }, [drawingShapes, selectedSideItem?.backsplash?.checked]);
};

export default useSideItems;
