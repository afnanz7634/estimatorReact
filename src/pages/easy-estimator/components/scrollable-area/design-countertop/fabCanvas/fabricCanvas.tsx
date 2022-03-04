import { CANVAS_OBJECT_TYPE_PREFIX, DEFAULT_DEPTH } from '@common/constants';
import { CornerInfo, DrawingShape } from '@common/models';
import {
    ColorContext,
    CornerRadiusContext,
    DrawingShapeContext,
    EdgeContext,
    FabricContext,
    PriceContext,
    ShapeContext,
} from '@ee-context';
import { getShapeArea } from 'pages/easy-estimator/components/price/utils/area-helper';
import React, { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { getCornerRadiusLabel } from '../canvas/drawing-tool/utils/drawing-helper';
import { generateSkeletonData, isPointInsidePolygon } from '../canvas/drawing-tool/utils/shape-helper';
import drawingTool from '../drawer/drawingTool';
import './fabricCanvas.scss';
import useSideItems from './useSideItems';
import Vec2 from 'vec2';
import { updateShapeByTranslation } from '../canvas/drawing-tool/utils/edit-dimension-helper';
import { CANVAS_CURSOR } from '../canvas/drawing-tool/utils/canvas-settings';
export interface FabricCanvasProps {
    width: number;
    height: number;
}

export function FabricCanvas(props: FabricCanvasProps) {
    const { width, height } = props;
    const canvasRef = useRef(null);

    const { canvas, initCanvas, activeFreeDrawing } = useContext(FabricContext);
    const { selectedShape, updateDrawingStatus, selectedSideItem } = useContext(ShapeContext);
    const {
        drawingShapes,
        updateDrawingShapes,
        activeDrawingShape,
        updateActiveDrawingShape,
        needRedrawCanvas,
        updateRedrawCanvasFlag,
    } = useContext(DrawingShapeContext);
    const { selectedColorState } = useContext(ColorContext);
    const { updateCounterTopArea } = useContext(PriceContext);
    const { selectedEdgeState } = useContext(EdgeContext);
    const { selectedCornerRadiusOnCardState } = useContext(CornerRadiusContext);

    const selectedColor = selectedColorState.color;
    const selectedEdge = selectedEdgeState.edge;
    const { isSelectedByUser } = selectedCornerRadiusOnCardState;
    const selectedCornerRadiusOnCard = selectedCornerRadiusOnCardState.cornerRadius;

    const drawingShapesRef = useRef([]);
    drawingShapesRef.current = drawingShapes;

    useLayoutEffect(() => {
        initCanvas(canvasRef.current);
    }, [canvasRef]);

    useEffect(() => {
        if (canvas) {
            // @PaulP this solves https://inscyth-inc.atlassian.net/browse/EE-612
            // maybe more advance selection logic should be done in the future
            canvas.selection = false;
            let shapeStartDrag: Vec2;
            let movingShape: DrawingShape | undefined;

            canvas.on({
                'mouse:down': function onMouseDown(e: any) {
                    if (e.target) {
                        if (e.target.name === CANVAS_OBJECT_TYPE_PREFIX.CORNER_RADIUS_CIRCLE) {
                            const radius: CornerInfo =
                                e.target.data?.parentDrawingShape?.cornerMap[e.target.data.cornerId];
                            const corners: CornerInfo[] = Object.values(e.target.data?.parentDrawingShape?.cornerMap);
                            let prev = corners.find(
                                (cr: CornerInfo) => cr.coords.x === radius.coords.x && cr.coords.y === radius.coords.y,
                            );
                            // replace existing with a new one
                            if (prev) prev = radius;

                            canvas.remove(e.target);

                            // update cornerRadius quantity by click
                            radius.productId = e.target.data?.selectedCornerRadiusOnCard?.productId;
                            radius.label = e.target.data?.selectedCornerRadiusOnCard?.name || '';
                            if (radius.label) radius.text?.set('text', getCornerRadiusLabel(radius.label));

                            canvas.renderAll();

                            updateDrawingShapes([...drawingShapesRef.current]);
                        } else {
                            drawingShapesRef.current?.map((shape: DrawingShape) => {
                                if (e.target.name === shape.canvasObjectName) {
                                    const pointer = canvas.getPointer(e);
                                    shapeStartDrag = pointer;
                                    // check to see if click is inside the actual counter polygon
                                    if (isPointInsidePolygon(shape, pointer)) {
                                        // beginning of moving a shape
                                        movingShape = shape;
                                        updateActiveDrawingShape(shape);
                                        updateRedrawCanvasFlag(true);
                                        updateDrawingStatus({ isShapeGeneratedState: true, isFreeDrawingState: false });
                                    } else {
                                        // if we are free drawing, do this (better way to test this?)
                                        if (canvas.freeDrawingCursor === CANVAS_CURSOR.FREE_DRAWING.DRAW) {
                                            updateRedrawCanvasFlag(true);
                                            movingShape = undefined;
                                        } else {
                                            movingShape = shape;
                                        }
                                    }
                                }
                            });
                        }
                    }
                },
                'mouse:up': function onMouseUp(e: any) {
                    // move the shape once dragging is done
                    if (movingShape) {
                        const pointer = canvas.getPointer(e);
                        const moveVec = shapeStartDrag.subtract(pointer, true);
                        updateShapeByTranslation(moveVec, movingShape);
                        updateDrawingShapes([...drawingShapesRef.current]);
                        updateDrawingStatus({ isShapeGeneratedState: true, isFreeDrawingState: false });
                        updateRedrawCanvasFlag(true);
                        movingShape = undefined;
                    }
                },
            });
        }

        return () => {
            drawingShapes?.forEach((shape: DrawingShape) => {
                shape?.onTextChange?.unsubscribe();
            });
            if (canvas) canvas.off('mouse:down');
        };
    }, [canvas]);

    useLayoutEffect(() => {
        if (canvas) {
            canvas.setWidth(width);
            canvas.setHeight(height);
            canvas.calcOffset();
            canvas.absolutePan({
                x: -width / 2,
                y: -height / 2,
            });
        }
    }, [width, height]);

    // on another shape selected
    useEffect(() => {
        if (canvas && selectedShape) {
            const dShapes = drawingTool.buildShapeFromPredefinedShape(selectedShape);
            updateDrawingShapes([...dShapes]);
            updateRedrawCanvasFlag(true);
        }
    }, [selectedShape?.type]);

    useEffect(() => {
        //Added for the performance
        if (!needRedrawCanvas) return;

        drawingTool.clearCanvas(canvas);

        if (!drawingShapes || drawingShapes.length == 0 || !selectedColor || !selectedColor.overlayColor) return;

        drawingTool.addDrawingShape(canvas, drawingShapes);
        drawingTool.addMeasurements(canvas, drawingShapes, selectedColor?.overlayColor);
        drawingTool.fillColor(canvas, selectedColor);
        drawingTool.addCornerRadiiMeasurements(canvas, drawingShapes, selectedCornerRadiusOnCard);
        drawingTool.addShapeText(canvas, drawingShapes, selectedColor?.overlayColor);

        if (drawingShapes.length >= 1) {
            // for the first drawn shapes, set the first shape as selected active shape
            // for previously selected shape, set it as selected when drawing area is being redrawn
            activeDrawingShape
                ? updateActiveDrawingShape(activeDrawingShape)
                : updateActiveDrawingShape(drawingShapes[0]);
        }

        let area = 0.0;
        drawingShapes.forEach((shape: DrawingShape) => {
            shape?.onTextChange?.subscribe((text: string) => {
                shape.label = text;
                updateDrawingShapes([...drawingShapes]);
                updateRedrawCanvasFlag(true);
            });

            area += getShapeArea(shape);

            // add backsplash
            shape?.removedElementsHistory?.edgesAndCorners
                .filter((edgeAndCorners) => edgeAndCorners.drawingEdge?.backsplash?.depth > 0)
                .forEach((edgeAndCorners) => {
                    drawingTool.addBacksplash(
                        canvas,
                        shape,
                        edgeAndCorners.appliedCorners,
                        edgeAndCorners.drawingEdge,
                        edgeAndCorners.drawingEdge?.backsplash?.depth,
                        selectedColor,
                    );
                    updateDrawingShapes([...drawingShapes]);
                });
        });

        updateCounterTopArea(area);

        canvas.renderAll();

        updateRedrawCanvasFlag(false);
    }, [drawingShapes, selectedColor?.overlayColor]);

    // add edge name
    useEffect(() => {
        if (selectedEdge && drawingShapes?.length && selectedColor) {
            drawingTool.addEdgeName(canvas, selectedEdge.name, selectedColor.overlayColor);
        }
    }, [selectedEdge, drawingShapes, selectedColor?.overlayColor]);

    // on color change
    useEffect(() => {
        if (selectedColor && selectedColor.swatchImageUrl && drawingShapes)
            drawingTool.fillColor(canvas, selectedColor);
    }, [selectedColor]);

    // on corner selected
    useEffect(() => {
        if (drawingShapes?.length) {
            drawingTool.removeObjectByName(canvas, CANVAS_OBJECT_TYPE_PREFIX.CORNER_RADIUS_CIRCLE);

            drawingShapes.map((drawingShape: DrawingShape) => {
                if (drawingShape && isSelectedByUser) {
                    drawingTool.addCirclesToOutlinePointsOfShape(canvas, drawingShape, selectedCornerRadiusOnCard);
                }
            });
        }
    }, [selectedCornerRadiusOnCard, isSelectedByUser]);

    // on side item selected
    useSideItems();

    useEffect(() => {
        if (activeDrawingShape && selectedColor) {
            drawingTool.selectShape(canvas, activeDrawingShape, selectedColor.overlayColor);
        }
    }, [activeDrawingShape, selectedColor?.overlayColor, needRedrawCanvas]);

    useEffect(() => {
        if (activeFreeDrawing) {
            const skData = generateSkeletonData(activeFreeDrawing, DEFAULT_DEPTH * 0.5);
            const dShape = drawingTool.buildShapeFromSkeleton(skData);
            updateDrawingShapes([...drawingShapes, dShape]);
            updateRedrawCanvasFlag(true);

            // TODO find another way to do this/ still based on luck
            //Asynchronous processing for waiting for drawingShapes get updated
            setTimeout(() => {
                updateActiveDrawingShape(dShape);
            }, 0);
        }
    }, [activeFreeDrawing]);

    return <canvas ref={canvasRef} id="fabric-canvas" width={width} height={height} />;
}
