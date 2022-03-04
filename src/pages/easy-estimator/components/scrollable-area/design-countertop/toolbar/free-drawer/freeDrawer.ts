import { CANVAS_OBJECT_TYPE_PREFIX, DEFAULT_DEPTH, FREE_DRAWING_SHAPE_MINIMUM_LENGTH } from '@common/constants';
import { FabricContext, ShapeContext } from '@ee-context';
import { DrawingState } from '@ee-reducer';
import { fabric } from 'fabric';
import { useCallback, useContext, useEffect, useState } from 'react';
import Vec2 from 'vec2';
import { CANVAS_CURSOR } from '../../canvas/drawing-tool/utils/canvas-settings';
import { FreeDrawerRealTimeLength, MakeNewPoint } from '../../canvas/drawing-tool/utils/shape-helper';

const useFreeDrawer = () => {
    const { drawingState, updateDrawingStatus } = useContext(ShapeContext);

    const defaultW = DEFAULT_DEPTH;
    const { canvas, updateActiveFreeDrawing } = useContext(FabricContext);

    const [mouseDownState, setMouseDownState] = useState(false);
    const [points, setPoints] = useState<Array<Vec2>>([]);
    const [drawingObject, setDrawingObject] = useState<any>(null);
    const [lengthObject, setLengthObject] = useState<any>(null);

    const getNewPoint = MakeNewPoint(points, defaultW);
    const { isFreeDrawingState } = drawingState;

    const mouseDown = useCallback(
        (evt) => {
            if (!isFreeDrawingState) return;
            fabric.Object.prototype.selectable = false;
            canvas.selection = false;

            const pt = canvas.getPointer(evt);
            setPoints([new Vec2(pt)]);
            setMouseDownState(true);
        },
        [canvas, isFreeDrawingState],
    );

    const mouseMove = useCallback(
        (evt) => {
            if (!isFreeDrawingState || !mouseDownState) return;
            const pt = canvas.getPointer(evt);
            const l = points.length;
            let newPt = getNewPoint(l - 1, pt);
            if (!newPt) {
                if (l > 1) {
                    newPt = getNewPoint(l - 2, pt);
                    if (newPt) {
                        const newPoints = [...points.slice(0, l - 1), newPt];
                        setPoints(newPoints);
                    }
                }
            } else {
                const newPoints = [...points, newPt];
                setPoints(newPoints);
            }
        },
        [canvas, getNewPoint, isFreeDrawingState, mouseDownState, points],
    );

    const mouseUp = useCallback(
        (evt) => {
            if (!isFreeDrawingState) return;
            setMouseDownState(false);
            // fabric.Object.prototype.selectable = false;
            // canvas.selection = false;

            resetCanvas();

            if (points.length > 1 && lengthObject.data.value >= FREE_DRAWING_SHAPE_MINIMUM_LENGTH) {
                updateActiveFreeDrawing(points);
            } else {
                updateActiveFreeDrawing(null);
            }
        },
        [canvas, isFreeDrawingState, points],
    );

    const activate = (drawingState: DrawingState) => {
        updateDrawingStatus(drawingState);
        setPoints([]);
    };

    const resetCanvas = () => {
        canvas.getObjects().map((obj: any) => {
            if (
                obj.name === CANVAS_OBJECT_TYPE_PREFIX.FREE_DRAWING_TEMP_LENGTH ||
                obj.name === CANVAS_OBJECT_TYPE_PREFIX.FREE_DRAWING_TEMP_SHAPE
            ) {
                canvas.remove(obj);
            }
        });

        canvas.renderAll();
    };

    useEffect(() => {
        if (!canvas) return;
        canvas.on('mouse:down', mouseDown);
        canvas.on('mouse:move', mouseMove);
        canvas.on('mouse:up', mouseUp);

        return () => {
            canvas.off('mouse:down', mouseDown);
            canvas.off('mouse:move', mouseMove);
            canvas.off('mouse:up', mouseUp);
        };
    }, [canvas, mouseDown, mouseMove, mouseUp]);

    useEffect(() => {
        if (canvas && isFreeDrawingState && points.length > 1) {
            const opt = {
                stroke: 'grey',
                strokeWidth: DEFAULT_DEPTH,
                fill: 'transparent',
                name: CANVAS_OBJECT_TYPE_PREFIX.FREE_DRAWING_TEMP_SHAPE,
            };
            canvas.remove(drawingObject);
            const freeShape = new fabric.Polyline(points, opt);
            canvas.add(freeShape);

            setDrawingObject(freeShape);

            canvas.remove(lengthObject);

            const lengthInfo = FreeDrawerRealTimeLength(points);
            const lengthObj = new fabric.Text(`Length (in.): ${lengthInfo.length.toString()}`, {
                left: lengthInfo.pos.x,
                top: lengthInfo.pos.y,
                stroke: 'grey',
                strokeWidth: 0.1,
                fontSize: 3,
                name: CANVAS_OBJECT_TYPE_PREFIX.FREE_DRAWING_TEMP_LENGTH,
                data: {
                    value: lengthInfo.length,
                },
            });
            canvas.add(lengthObj).renderAll();
            setLengthObject(lengthObj);
        }
    }, [canvas, isFreeDrawingState, points]);

    useEffect(() => {
        if (!canvas) return;
        //cursor management
        if (isFreeDrawingState) {
            canvas.defaultCursor = CANVAS_CURSOR.FREE_DRAWING.DEFAULT;
            canvas.hoverCursor = CANVAS_CURSOR.FREE_DRAWING.HOVER;
            canvas.freeDrawingCursor = CANVAS_CURSOR.FREE_DRAWING.DRAW;
        } else {
            canvas.defaultCursor = CANVAS_CURSOR.DEFAULT.DEFAULT;
            canvas.hoverCursor = CANVAS_CURSOR.DEFAULT.HOVER;
            canvas.freeDrawingCursor = CANVAS_CURSOR.DEFAULT.DRAW;
        }
    }, [isFreeDrawingState]);

    return {
        activate,
    };
};

export default useFreeDrawer;
