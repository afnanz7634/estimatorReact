import {
    BACKSPLASH,
    CANVAS_OBJECT_TYPE_PREFIX,
    CIRCLE_CORNER_RADIUS,
    DRAWING_SHAPE_COLOR_PALETTE,
    OPACITY_CIRCLE_CORNER,
} from '@common/constants';
import { LineDirection } from '@common/enums';
import { ShapeType } from '@common/enums/shape-types.enum';
import {
    ArrowInfo,
    Backsplash,
    ColorModel,
    CornerInfo,
    CornerRadiusModel,
    DrawingEdge,
    DrawingShape,
    LineSegment,
    PredefinedShape,
    RemovedEdgeAndCorners,
    Skeleton,
} from '@common/models';
import { fabric } from 'fabric';
import { IObjectOptions } from 'fabric/fabric-impl';
import { uniqueId } from 'lodash';
import { Subject } from 'rxjs';
import Vec2 from 'vec2';
import { getLetterStartIndex } from '../canvas/drawing-tool/builders/measurements-builder';
import {
    EDGE_STROKE_WIDTH,
    OFFSET_BACKSPLASH,
    OFFSET_MEASUREMENT,
    OFFSET_MEASUREMENT_TEXT,
} from '../canvas/drawing-tool/utils/canvas-settings';
import { getCornerRadiusLabel } from '../canvas/drawing-tool/utils/drawing-helper';
import {
    convertFromRadiansToDegree,
    get025Rounds,
    getMidpoint,
    getTopLeftVector,
} from '../canvas/drawing-tool/utils/math-helper';
import {
    cleanSkeletonPoints,
    getArrowsFromOutlines,
    getBacksplashArrowsFromOutlines,
    getCornerLabelPosition,
    getDirection,
    getOutlinePointsFromShape,
    getOutlinePts,
    getRefinedEdgePoints,
} from '../canvas/drawing-tool/utils/shape-helper';
import variables from './variables.module.scss';

const drawingTool = {
    buildShapeFromSkeleton: (sData: Skeleton): DrawingShape | void => {
        const cleanSkeleton = cleanSkeletonPoints(sData);
        if (!cleanSkeleton) {
            return;
        }

        const outlineData = getOutlinePts(cleanSkeleton);

        if (!outlineData) {
            return;
        }

        const corners: {
            [key: string]: CornerInfo;
        } = {};

        outlineData.map((point) => {
            const id = uniqueId();
            const corner = {
                id,
                coords: point.coords!,
                isUpper: point.isUpper!,
                skIndex: point.skIndex!,
                isVisibleInCanvas: true,
            };

            corners[id] = corner;
        });

        const dShapeId = uniqueId();

        const edges = Object.keys(corners).map((key, index) => {
            const startCornerId = corners[key].id;
            let endCornerId;

            if (index == Object.keys(corners).length - 1) {
                endCornerId = Object.values(corners)[0].id;
            } else {
                endCornerId = Object.values(corners)[index + 1].id;
            }

            const dirVec = corners[endCornerId].coords.subtract(corners[startCornerId].coords, true);
            const normalVec = dirVec.rotate(Math.PI / 2, undefined, true).normalize();
            const isVisibleInCanvas = true;
            const backsplash: Backsplash = { depth: 0, arrowsInfo: [] };

            return {
                id: uniqueId(),
                startCornerId,
                endCornerId,
                normalVec,
                dirVec,
                isVisibleInCanvas,
                drawingShapeId: dShapeId,
                backsplash,
            };
        });

        const drawingShape: DrawingShape = {
            type: ShapeType.PREDEFINED_SHAPE,
            arrowsInfo: [],
            canvasObjectName: CANVAS_OBJECT_TYPE_PREFIX.SHAPE_MAIN + '_' + uniqueId(),
            skeleton: cleanSkeleton,
            cornerMap: corners,
            drawingEdges: edges,
            removedElementsHistory: { edgesAndCorners: [] },
            id: dShapeId,
        };

        const outlinePoints = outlineData.map((item) => item.coords!);
        const arrows = getArrowsFromOutlines(outlinePoints);
        arrows.map((arrow, index) => {
            drawingShape?.arrowsInfo?.push({
                path: arrow.path,
                isInterior: arrow.isInterior,
                drawingEdgeId: drawingShape?.drawingEdges[index]?.id,
                length: arrow.length,
                isVisibleInCanvas: true,
                iActiveForEdgeCalc: true,
            });
        });

        return drawingShape;
    },

    rebuildShapeFromNewSkeleton: (sData: Skeleton, oldShape: DrawingShape): void => {
        // may have some similar (ok duplicate) code from buildShapeFromSkeleton:
        // takes an existing shape and applies a new skeleton to it, adjusting all that needs
        // to be adjusted and leaving alone that which does not

        // get new outline data from new skeleton
        const outlineData = getOutlinePts(sData);
        if (!outlineData) {
            return;
        }

        const corners: {
            [key: string]: CornerInfo;
        } = {};

        // update edges as needed based on new outline data, referencing old edges when required
        const edges = Object.keys(oldShape.cornerMap).map((key, index) => {
            corners[key] = oldShape.cornerMap[key];
            corners[key].coords = outlineData[index].coords!;

            const startCornerId = corners[key].id;
            let endCornerIndex;

            if (index == Object.keys(oldShape.cornerMap).length - 1) {
                endCornerIndex = 0;
            } else {
                endCornerIndex = index + 1;
            }
            const endCornerId = Object.values(oldShape.cornerMap)[endCornerIndex].id;
            const dirVec = outlineData[endCornerIndex].coords!.subtract(outlineData[index].coords!, true);

            const normalVec = dirVec.rotate(Math.PI / 2, undefined, true).normalize();
            const isVisibleInCanvas = oldShape.drawingEdges[index].isVisibleInCanvas;
            oldShape.drawingEdges[index].backsplash.arrowsInfo = [];

            return {
                id: oldShape.drawingEdges[index].id,
                startCornerId,
                endCornerId,
                normalVec,
                dirVec,
                isVisibleInCanvas,
                drawingShapeId: oldShape.id,
                backsplash: oldShape.drawingEdges[index].backsplash,
            };
        });

        // adjust the directional and normal vectors inside the removedElementsHistory list
        if (oldShape.removedElementsHistory) {
            oldShape.removedElementsHistory.edgesAndCorners.forEach((remEdgeCorner: RemovedEdgeAndCorners) => {
                remEdgeCorner.drawingEdge.dirVec = remEdgeCorner.appliedCorners[1].coords!.subtract(
                    remEdgeCorner.appliedCorners[0].coords!,
                    true,
                );
                remEdgeCorner.drawingEdge.normalVec = remEdgeCorner.drawingEdge.dirVec
                    .rotate(Math.PI / 2, undefined, true)
                    .normalize();
            });
        }

        oldShape.skeleton = sData;
        oldShape.cornerMap = corners;
        oldShape.drawingEdges = edges;
        const oldArrowInfo = oldShape.arrowsInfo;
        oldShape.arrowsInfo = [];

        const outlinePoints = outlineData.map((item) => item.coords!);
        const arrows = getArrowsFromOutlines(outlinePoints);
        if (oldArrowInfo) {
            arrows.map((arrow, index) => {
                oldShape.arrowsInfo?.push({
                    path: arrow.path,
                    isInterior: arrow.isInterior,
                    drawingEdgeId: oldShape.drawingEdges[index]?.id,
                    length: arrow.length,
                    isVisibleInCanvas: oldArrowInfo[index].isVisibleInCanvas,
                    iActiveForEdgeCalc: oldArrowInfo[index].iActiveForEdgeCalc,
                });
            });
        }
    },

    buildShapeFromPredefinedShape: (pShape: PredefinedShape): Array<DrawingShape> => {
        const dShapes: Array<DrawingShape> = [];

        pShape.skeletonData.map((sData) => {
            const dShape = drawingTool.buildShapeFromSkeleton(sData);

            if (dShape) {
                dShapes.push(dShape);
            }
        });

        return dShapes;
    },

    addDrawingShape: (canvas: fabric.Canvas, shapes: DrawingShape[]): void => {
        const opt: IObjectOptions = {
            fill: 'transparent',
            selectable: true,
            stroke: 'transparent',
            //Movement:
            lockMovementX: false,
            lockMovementY: false,
            //Scaling:
            lockScalingX: true,
            lockScalingY: true,
            //Rotation:
            lockRotation: true,
            //frame/bounidngBox:
            hasControls: false,
            hasBorders: false,
        };

        shapes.forEach((shape) => {
            if (!shape?.cornerMap) return;

            opt.name = shape?.canvasObjectName;
            const outlinePoints = getOutlinePointsFromShape(shape);
            const outline = new fabric.Polygon(outlinePoints, opt);
            canvas.add(outline);

            drawingTool.addDrawingEdgeToCanvas(canvas, shape);
        });
    },

    addDrawingEdgeToCanvas: (canvas: fabric.Canvas, shape: DrawingShape): void => {
        if (!shape) return;

        const optEdge: IObjectOptions = {
            fill: 'transparent',
            selectable: false,
            stroke: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE,
            strokeLineCap: 'round',
            strokeWidth: EDGE_STROKE_WIDTH,
        };

        optEdge.data = {
            parentName: shape.canvasObjectName,
            highlightable: true,
        };

        shape.drawingEdges
            .filter((edge) => edge.isVisibleInCanvas)
            .map((edge) => {
                const startPt = shape.cornerMap[edge.startCornerId];
                const endPt = shape.cornerMap[edge.endCornerId];

                optEdge.name = `${CANVAS_OBJECT_TYPE_PREFIX.SHAPE_EDGE}_${edge.id}`;
                const drawingPoints = getRefinedEdgePoints(
                    [startPt.coords.x, startPt.coords.y, endPt.coords.x, endPt.coords.y],
                    optEdge.strokeWidth,
                );

                const edgeObj = new fabric.Line(drawingPoints, optEdge);

                canvas.add(edgeObj);
            });
    },

    fillColor: (canvas: fabric.Canvas, color: ColorModel): void => {
        // fill with slab image if available
        let url;
        if (color.slabImageUrl) {
            url = color.slabImageUrl;
        } else {
            url = color.swatchImageUrl;
        }

        fabric.util.loadImage(url, (img: HTMLImageElement) => {
            for (let i = 0; i < canvas.getObjects().length; i++) {
                let drawingShape: fabric.Object = new fabric.Object();

                // fill color for main shape polygon and backsplash polygon contained in the backsplash group
                if (canvas.getObjects()[i].name?.includes(CANVAS_OBJECT_TYPE_PREFIX.SHAPE_MAIN)) {
                    drawingShape = canvas.getObjects()[i];
                } else if (canvas.getObjects()[i].name?.includes(CANVAS_OBJECT_TYPE_PREFIX.BACKSPLASH_GROUP)) {
                    const innerBacksplash = (canvas.getObjects()[i] as fabric.Group)
                        .getObjects()
                        .find((groupObject) =>
                            groupObject.name?.includes(CANVAS_OBJECT_TYPE_PREFIX.POLYGON_BACKSPLASH),
                        );
                    if (innerBacksplash) drawingShape = innerBacksplash;
                }

                drawingShape.set(
                    'fill',
                    new fabric.Pattern({
                        source: img,
                        repeat: 'repeat',
                        // transform matrix to change the pattern, imported from svgs.
                        patternTransform: [1 / 3, 0, 0, 1 / 3, 0, 0],
                    }),
                );
            }

            //This render is needed as it is inside async module
            //but only needs to execute once outside the loop
            canvas.renderAll();
        });
    },

    clearCanvas: (canvas: fabric.Canvas): void => {
        if (!canvas) return;
        canvas.remove(...canvas.getObjects());
    },

    createArrowGroup: (arrowInfo: ArrowInfo, opt: IObjectOptions): fabric.Group | undefined => {
        if (!arrowInfo.isVisibleInCanvas) return undefined;

        const arrowPts = arrowInfo.path;
        const mainSegment = new fabric.Polyline([arrowPts[0], arrowPts[1]], opt);
        const leftArrowWing = new fabric.Polyline([arrowPts[2], arrowPts[3], arrowPts[4]], opt);
        const rightArrowWing = new fabric.Polyline([arrowPts[5], arrowPts[6], arrowPts[7]], opt);

        const group = new fabric.Group([mainSegment, leftArrowWing, rightArrowWing], { selectable: false });
        return group;
    },

    addMeasurements: (canvas: fabric.Canvas, shapes: DrawingShape[], color: string): void => {
        const opt: IObjectOptions = {
            stroke: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE,
            strokeWidth: 0.1,
            fill: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE,
            selectable: false,
            data: {},
        };

        shapes.map((shape: DrawingShape) => {
            const outlinePoints = getOutlinePointsFromShape(shape);
            if (!shape.establishedLetterStartIndex) {
                // prevents rotating shapes from swapping out edge letters
                shape.establishedLetterStartIndex = getLetterStartIndex(outlinePoints);
            }
            const letterStartIndex = shape.establishedLetterStartIndex;
            const interiorCnts = shape?.arrowsInfo?.filter((item) => item.isInterior).length || 0;
            let arrowIdxCnt = 0;

            shape?.arrowsInfo?.map((arrowInfo: ArrowInfo) => {
                const arrowPts = arrowInfo.path;
                const group = drawingTool.createArrowGroup(arrowInfo, opt);
                if (group) {
                    group.data = {
                        parentName: shape?.canvasObjectName,
                        highlightable: true,
                        inInterior: arrowInfo.isInterior,
                    };

                    canvas.add(group);
                }

                let letter = '';
                if (!arrowInfo.isInterior) {
                    letter = String.fromCharCode(
                        arrowIdxCnt <= letterStartIndex
                            ? 65 + letterStartIndex - arrowIdxCnt
                            : 65 + (shape?.arrowsInfo?.length || 0) - arrowIdxCnt + letterStartIndex - interiorCnts,
                    );
                    arrowIdxCnt++;
                }

                drawingTool.addMeasureText(
                    canvas,
                    {
                        startPoint: arrowPts[0],
                        endPoint: arrowPts[1],
                    },
                    letter,
                    arrowInfo,
                    color,
                    shape?.canvasObjectName,
                );
            });
        });
    },

    getMeasurementPosition: (arrow: LineSegment, text: fabric.Text, normalVec: Vec2): Vec2 => {
        const pos = arrow.startPoint.add(arrow.endPoint, true).multiply(0.5);
        const boundRc = text.getBoundingRect();
        const direction = getDirection(arrow);

        let sign = 1;
        switch (direction) {
            case LineDirection.TOP:
                pos.add(normalVec.multiply(OFFSET_MEASUREMENT_TEXT + boundRc.height, true));
                pos.set(pos.x - boundRc.width * 0.5, pos.y, false);
                break;
            case LineDirection.BOTTOM:
                pos.add(normalVec.multiply(OFFSET_MEASUREMENT_TEXT, true));
                pos.set(pos.x - boundRc.width * 0.5, pos.y, false);
                break;
            case LineDirection.VERTICAL_LEFT:
                pos.set(pos.x - boundRc.width - OFFSET_MEASUREMENT, pos.y - boundRc.height * 0.5, false);
                break;
            case LineDirection.VERTICAL_RIGHT:
                pos.set(pos.x + OFFSET_MEASUREMENT, pos.y - boundRc.height * 0.5, false);
                break;
            case LineDirection.LEFT:
                sign = normalVec.y < 0 ? -1 : 0;
                pos.set(pos.x - boundRc.width, pos.y + sign * boundRc.height, false);
                break;
            default:
                sign = normalVec.y < 0 ? -1 : 0;
                pos.set(pos.x, pos.y + sign * boundRc.height, false);
                break;
        }

        //Pos refinement
        if (sign == 0 && (direction === LineDirection.LEFT || direction === LineDirection.RIGHT)) {
            pos.set(pos.x, pos.y + OFFSET_MEASUREMENT, false);
        }
        return pos;
    },

    addMeasureText: (
        canvas: fabric.Canvas,
        arrow: LineSegment,
        label: string,
        arrowInfo: ArrowInfo,
        color: string,
        parentName?: string,
    ): void => {
        const diffVec = arrow.endPoint.subtract(arrow.startPoint, true);
        const dist = arrowInfo.length!;
        const normalVec = diffVec.rotate(Math.PI / 2, undefined, true).normalize();
        arrowInfo.label = label;
        arrowInfo.length = dist;

        if (!arrowInfo.isVisibleInCanvas) return;

        const text = arrowInfo.isInterior
            ? new fabric.Text(`${dist}″`, {
                  fontFamily: variables.fontFamily,
                  fill: color,
                  stroke: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE,
                  strokeWidth: 0.1,
                  fontSize: 4,
                  selectable: false,
                  data: {
                      parentName,
                      highlightable: true,
                      inInterior: true,
                  },
              })
            : new fabric.Text(`${label} ${dist}″`, {
                  stroke: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE,
                  fill: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE,
                  strokeWidth: 0.1,
                  fontSize: 2.5,
                  fontFamily: variables.fontFamily,
                  selectable: false,
                  name: CANVAS_OBJECT_TYPE_PREFIX.SHAPE_MEASURE_LABEL + uniqueId(),
                  data: {
                      parentName,
                      highlightable: true,
                      rawText: `${label} ${dist}″`,
                      value: dist,
                  },
              });

        const pos = drawingTool.getMeasurementPosition(arrow, text, normalVec);

        text.left = pos.x;
        text.top = pos.y;

        canvas.add(text);
    },

    addShapeText: (canvas: fabric.Canvas, shapes: Array<DrawingShape>, color: string): void => {
        shapes.map((shape, index) => {
            const outlinePoints = getOutlinePointsFromShape(shape);
            const topLeft = getTopLeftVector(outlinePoints);
            let shapeLabel = `Shape ${index + 1}`;

            // this just uses a shape's name if it already exists (doesn't wipe it out everytime)
            if (shape.label && shapeLabel) {
                shapeLabel = shape.label;
            }
            const iText = new fabric.IText(shapeLabel, {
                fontFamily: variables.fontFamily,
                stroke: color,
                fill: color,
                height: 100,
                strokeWidth: 0.05,
                left: topLeft?.x + 2,
                top: topLeft?.y + 2,
                editable: true,
                fontSize: 5,
                hoverCursor: 'pointer',
                hasControls: false,
                lockMovementX: true,
                lockMovementY: true,
                name: `${CANVAS_OBJECT_TYPE_PREFIX.SHAPE_LABEL}_${shapeLabel}`,
                data: {
                    parentName: shape?.canvasObjectName,
                    highlightable: true,
                    inInterior: true,
                },
            });

            // max tex length should be 9
            iText.on('editing:entered', () => {
                iText?.hiddenTextarea?.setAttribute('maxlength', '9');
            });

            // disable newline
            iText.onKeyDown = (e: KeyboardEvent) => {
                if (e.keyCode === 13) {
                    iText.exitEditing();
                }
            };

            shape.label = shapeLabel;
            shape.onTextChange = new Subject();
            iText.on('editing:exited', () => {
                if (iText.text?.trim() !== '') {
                    shape?.onTextChange?.next(iText.text || '');
                } else {
                    iText.set('text', shape.label);
                    shape?.onTextChange?.next(iText.text);
                    // won't render since is set from react
                }
            });

            canvas.add(iText);
        });
    },

    rotateAndPositionBacksplashLabel: (label: fabric.Text, directionVector: Vec2): void => {
        const dirVec = directionVector;

        const angleBetweenVectAndX = Math.atan2(dirVec.y, dirVec.x);
        let convertedAngle = convertFromRadiansToDegree(angleBetweenVectAndX);
        if (convertedAngle <= -90) {
            convertedAngle += 180;
        } else if (convertedAngle > 90) {
            convertedAngle -= 180;
        }

        // adjust the label position based on the required rotation (EE-966)
        const adjY = 1.7;
        const adjX = 8;
        const cos = Math.cos((convertedAngle * Math.PI) / 180);
        const sin = Math.sin((convertedAngle * Math.PI) / 180);
        label.top! -= adjY * cos + adjX * sin;
        label.left! -= adjX * cos - adjY * sin;

        // now actually do the rotation
        label.centeredRotation = false; // it's way off without this line
        label.rotate(convertedAngle);
    },

    addArrowInfoMeasurement: (shape: DrawingShape, arrow: LineSegment, arrowInfo: ArrowInfo): fabric.Text => {
        const diffVec = arrow.endPoint.subtract(arrow.startPoint, true);
        const normalVec = diffVec.rotate(Math.PI / 2, undefined, true).normalize();
        const dist = get025Rounds(diffVec.length());
        arrowInfo.length = dist;

        // add backsplash measurements
        const labelMeasurement =
            arrowInfo.label?.length === 0 ? `${arrowInfo.length}″` : `${arrowInfo.label} ${arrowInfo.length}″`;
        const text = new fabric.Text(labelMeasurement, {
            stroke: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE,
            fill: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE,
            strokeWidth: 0.1,
            fontSize: 2.5,
            fontFamily: variables.fontFamily,
            selectable: false,
            name: CANVAS_OBJECT_TYPE_PREFIX.BACKSPLASH_MEASURE_LABEL + uniqueId(),
            data: {
                parentName: shape?.canvasObjectName,
                highlightable: true,
                rawText: `${arrowInfo.label} ${arrowInfo.length}″`,
                value: arrowInfo.length,
            },
        });

        // get position of the measurements
        const pos = drawingTool.getMeasurementPosition(arrow, text, normalVec);

        text.left = pos.x;
        text.top = pos.y;

        return text;
    },

    addBacksplashArrows: (
        canvas: fabric.Canvas,
        shape: DrawingShape,
        outlinePoints: Vec2[],
        drawingEdge: DrawingEdge,
    ): fabric.Group | undefined => {
        if (!shape) return;
        let backsplashArrowsgroup: fabric.Group | undefined = new fabric.Group([], { selectable: false });
        const arrowOpt: IObjectOptions = {
            stroke: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE,
            strokeWidth: 0.1,
            fill: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE,
            selectable: false,
            data: {},
        };

        const removedArrowInfoByDrawingEdge = shape?.arrowsInfo?.find(
            (arrowInfo) => arrowInfo.drawingEdgeId === drawingEdge.id && !arrowInfo.isVisibleInCanvas,
        );

        // create and return backsplash arrow group
        const arrows = getBacksplashArrowsFromOutlines(outlinePoints, removedArrowInfoByDrawingEdge?.label!);
        if (drawingEdge?.backsplash?.arrowsInfo?.length === 0) {
            arrows.map((arrow, index) => {
                drawingEdge?.backsplash?.arrowsInfo?.push({
                    path: arrow.path,
                    label: arrow.label,
                    isVisibleInCanvas: true,
                });
            });
        }

        drawingEdge?.backsplash?.arrowsInfo?.map((arrowInfo, index) => {
            drawingTool.removeObjectByName(canvas, `${CANVAS_OBJECT_TYPE_PREFIX.BACKSPLASH_ARROW}_${index}`, true);

            backsplashArrowsgroup = drawingTool.createArrowGroup(arrowInfo, arrowOpt);
            if (!backsplashArrowsgroup) return;

            // add labels for each arrow
            const arrowPts = arrowInfo.path;
            const lineSegment = {
                startPoint: arrowPts[0],
                endPoint: arrowPts[1],
            };
            const measurementText = drawingTool.addArrowInfoMeasurement(shape, lineSegment, arrowInfo);

            backsplashArrowsgroup.data = {
                parentName: shape.canvasObjectName,
                highlightable: true,
                name: `${CANVAS_OBJECT_TYPE_PREFIX.BACKSPLASH_ARROW}_${index}`,
            };

            canvas.add(backsplashArrowsgroup!, measurementText);
        });
        return backsplashArrowsgroup;
    },

    addBacksplash: (
        canvas: fabric.Canvas,
        shape: DrawingShape,
        corners: CornerInfo[],
        drawingEdge: DrawingEdge,
        depth: number,
        selectedColor: ColorModel,
    ) => {
        if (!depth || !corners || !shape) {
            return;
        }

        drawingTool.removeObjectByName(canvas, `${CANVAS_OBJECT_TYPE_PREFIX.BACKSPLASH_GROUP}_${drawingEdge.id}`, true);

        const optBackSplash: IObjectOptions = {
            fill: 'transparent',
            selectable: false,
            stroke: 'transparent',
            name: CANVAS_OBJECT_TYPE_PREFIX.POLYGON_BACKSPLASH + uniqueId(),
        };

        optBackSplash.data = {
            parentName: shape?.canvasObjectName,
        };

        // create backsplash from removed drawing edge corner, offset and depth of the backsplash
        const normalVec = drawingEdge.normalVec;
        const lbPt = corners[0].coords.add(normalVec.multiply(OFFSET_BACKSPLASH, true), true);
        const rbPt = corners[1].coords.add(normalVec.multiply(OFFSET_BACKSPLASH, true), true);
        const ltPt = lbPt.add(normalVec.multiply(depth, true), true);
        const rtPt = rbPt.add(normalVec.multiply(depth, true), true);

        const backsplashOutlinePoints = [ltPt, rtPt, rbPt, lbPt]; // EE-968 no need to convert order, already sorted
        const backSplashPolygon = new fabric.Polygon(backsplashOutlinePoints, optBackSplash);

        // add arrows object to backsplash
        const backsplashArrows = drawingTool.addBacksplashArrows(canvas, shape, backsplashOutlinePoints, drawingEdge);

        // add backsplash label
        const midPoint = getMidpoint(ltPt, rbPt); // only one midpoint needed (EE-966) //
        const backsplashLabel = new fabric.IText(BACKSPLASH, {
            fontFamily: variables.fontFamily,
            stroke: selectedColor.overlayColor,
            fill: selectedColor.overlayColor,
            left: midPoint.x,
            top: midPoint.y,
            height: 50,
            strokeWidth: 0.05,
            textAlign: 'center',
            editable: false,
            fontSize: 3,
            hoverCursor: 'pointer',
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true,
            name: `${CANVAS_OBJECT_TYPE_PREFIX.BACKSPLASH_LABEL}`,
            data: {
                parentName: shape?.canvasObjectName,
                highlightable: true,
                inInterior: true,
            },
        });

        drawingTool.rotateAndPositionBacksplashLabel(backsplashLabel, drawingEdge.dirVec);

        if (backsplashArrows) {
            // add backsplash group
            const backSplahGroup = new fabric.Group([backSplashPolygon, backsplashLabel], {
                selectable: false,
            });

            backSplahGroup.name = `${CANVAS_OBJECT_TYPE_PREFIX.BACKSPLASH_GROUP}_${drawingEdge.id}`;
            canvas.add(backSplahGroup);
        }

        canvas.renderAll();
    },

    selectShape: (canvas: fabric.Canvas, activeDrawingShape: DrawingShape, color: string): void => {
        drawingTool.removeObjectByName(canvas, CANVAS_OBJECT_TYPE_PREFIX.ACTIVE_SHAPE_HIGHLIGHTS, true);

        const targetList = canvas.getObjects().filter((obj) => obj.data && obj.data.highlightable);

        targetList.map((target: any) => {
            if (target.getObjects) {
                const children = target.getObjects();
                children?.map((child: fabric.Object) => {
                    if (target.data?.inInterior) {
                        child.set({
                            stroke: color,
                            fill: color,
                        });
                    } else {
                        if (target.data.parentName === activeDrawingShape.canvasObjectName) {
                            child.set({
                                stroke: DRAWING_SHAPE_COLOR_PALETTE.ACTIVE.STROKE,
                                fill: DRAWING_SHAPE_COLOR_PALETTE.ACTIVE.STROKE,
                            });
                        } else {
                            child.set({
                                stroke: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE,
                                fill: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE,
                            });
                        }
                    }
                });
            } else {
                if (target.data?.inInterior) {
                    target.set({ stroke: color });
                    target.set({ fill: color });
                } else {
                    if (target.data.parentName === activeDrawingShape.canvasObjectName) {
                        target.set({ stroke: DRAWING_SHAPE_COLOR_PALETTE.ACTIVE.STROKE });
                        if (!target.name?.toLocaleLowerCase().includes(CANVAS_OBJECT_TYPE_PREFIX.SHAPE_LABEL)) {
                            target.set({ fill: DRAWING_SHAPE_COLOR_PALETTE.ACTIVE.STROKE });
                        }

                        if (target.name && target.name.includes(CANVAS_OBJECT_TYPE_PREFIX.SHAPE_MEASURE_LABEL)) {
                            target.text = target.data.rawText;
                        }

                        if (target.name && target.name.includes(CANVAS_OBJECT_TYPE_PREFIX.BACKSPLASH_MEASURE_LABEL)) {
                            target.text = target.data.rawText;
                        }

                        // change edge stroke color
                        if (target.name && target.name.includes(CANVAS_OBJECT_TYPE_PREFIX.SHAPE_EDGE)) {
                            target.set({ stroke: variables.secondaryColor });
                        }
                    } else {
                        target.set({ stroke: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE });
                        if (!target.name?.toLocaleLowerCase().includes(CANVAS_OBJECT_TYPE_PREFIX.SHAPE_LABEL)) {
                            target.set({ fill: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE });
                        }

                        if (target.name && target.name.includes(CANVAS_OBJECT_TYPE_PREFIX.SHAPE_MEASURE_LABEL)) {
                            target.text = `${target.data.value}″`;
                        }

                        if (target.name && target.name.includes(CANVAS_OBJECT_TYPE_PREFIX.BACKSPLASH_MEASURE_LABEL)) {
                            target.text = `   ${target.data.value}″`;
                        }

                        if (target.name && target.name.includes(CANVAS_OBJECT_TYPE_PREFIX.SHAPE_EDGE)) {
                            target.set({ stroke: DRAWING_SHAPE_COLOR_PALETTE.NORMAL.STROKE });
                        }
                    }
                }
            }
        });
        canvas.renderAll();
    },

    getShapeLabels: (canvas: fabric.Canvas): Array<fabric.Object> => {
        return canvas
            .getObjects()
            .filter((obj) => obj.name?.toLocaleLowerCase().includes(CANVAS_OBJECT_TYPE_PREFIX.SHAPE_LABEL));
    },

    addEdgeName: (canvas: fabric.Canvas, text: string, color: string): void => {
        const shapeLabels = drawingTool.getShapeLabels(canvas);

        if (shapeLabels?.length) {
            drawingTool.removeObjectByName(canvas, CANVAS_OBJECT_TYPE_PREFIX.EDGE_NAME);

            shapeLabels.map((label, index) => {
                const edgeText = new fabric.Text(text, {
                    stroke: color,
                    fill: color,
                    strokeWidth: 0.1,
                    fontSize: 3.5,
                    fontFamily: 'Helvetica',
                    selectable: false,
                    name: `${CANVAS_OBJECT_TYPE_PREFIX.EDGE_NAME}_${index}`,
                    data: {
                        parentName: label.data?.parentName,
                        highlightable: true,
                    },
                });

                if (label.top && label.height) {
                    // To avoid tslint error
                    edgeText.top = label.top + label.height;
                }

                edgeText.left = label.left;

                const shapeObject = canvas
                    .getObjects()
                    .filter((obj) => obj.name?.toLocaleLowerCase().includes(label.data?.parentName))[0];

                let wrappedText = edgeText;
                if (shapeObject) {
                    const maxW = (shapeObject.width || 0) * 0.8; //Considering margin of this text
                    wrappedText = drawingTool.wrapCanvasText(edgeText, canvas, maxW, 0, 'left');
                }
                canvas.add(wrappedText);
            });
        }
    },

    addCornerRadiiMeasurements: (
        canvas: fabric.Canvas,
        shapes: DrawingShape[],
        selectedCornerRadius: CornerRadiusModel,
    ): void => {
        // populate cornerRadiusInfo array with initial values
        shapes.map((shape: DrawingShape) => {
            if (!shape) return;

            Object.values(shape.cornerMap).map((corner, index: number) => {
                if (corner.productId === undefined && selectedCornerRadius) {
                    corner.productId = selectedCornerRadius?.productId;
                    corner.label = selectedCornerRadius?.name;
                }
                if (corner.productId === undefined) return;

                const radiusText = drawingTool.addCornerRadiusMeasureText(canvas, shape, index, corner);
                corner.text = radiusText;
            });
        });
    },

    addCornerRadiusMeasureText: (
        canvas: fabric.Canvas,
        shape: DrawingShape,
        index: number,
        radiusInfo: CornerInfo,
    ): fabric.Text | undefined => {
        if (!shape) return;

        drawingTool.removeObjectByName(
            canvas,
            `${CANVAS_OBJECT_TYPE_PREFIX.CORNER_RADIUS_MEASUREMENT}_${radiusInfo.id}`,
            true,
        );

        if (radiusInfo.label && radiusInfo.isVisibleInCanvas) {
            // radiusInfo.isVisibleInCanvas added for EE-923
            const radiusText = new fabric.Text(getCornerRadiusLabel(radiusInfo.label), {
                fontFamily: 'Helvetica',
                stroke: DRAWING_SHAPE_COLOR_PALETTE.ACTIVE.STROKE,
                fill: DRAWING_SHAPE_COLOR_PALETTE.ACTIVE.STROKE,
                strokeWidth: 0.1,
                fontSize: 2.5,
                selectable: false,
                data: {
                    parentName: shape.canvasObjectName,
                    highlightable: true,
                },
                name: `${CANVAS_OBJECT_TYPE_PREFIX.CORNER_RADIUS_MEASUREMENT}_${radiusInfo.id}`,
            });

            const boundRc = radiusText.getBoundingRect();

            const outlinePoints = getOutlinePointsFromShape(shape);

            const beforeIndex = index - 1 < 0 ? outlinePoints.length - 1 : index - 1;
            const afterIndex = index + 1 > outlinePoints.length - 1 ? 0 : index + 1;

            const cornerPos = getCornerLabelPosition(
                outlinePoints[beforeIndex],
                outlinePoints[index],
                outlinePoints[afterIndex],
                boundRc.width,
                boundRc.height,
            );

            radiusText.left = cornerPos.x;
            radiusText.top = cornerPos.y;
            radiusInfo.text = radiusText;

            canvas.add(radiusText);

            return radiusText;
        }
    },

    addCirclesToOutlinePointsOfShape: (
        canvas: fabric.Canvas,
        parentDrawingShape: DrawingShape,
        selectedCornerRadiusOnCard: CornerRadiusModel,
    ): void => {
        if (!parentDrawingShape) return;
        Object.values(parentDrawingShape.cornerMap)
            .filter((radiusInfo) => radiusInfo.isVisibleInCanvas)
            .map((radiusInfo) => {
                const circle = new fabric.Circle({
                    left: radiusInfo.coords.x,
                    top: radiusInfo.coords.y,
                    radius: CIRCLE_CORNER_RADIUS,
                    fill: variables.secondaryColor,
                    opacity: OPACITY_CIRCLE_CORNER,
                    originX: 'center',
                    originY: 'center',
                    hasControls: false,
                    hasBorders: false,
                    selectable: false,
                    name: CANVAS_OBJECT_TYPE_PREFIX.CORNER_RADIUS_CIRCLE,
                    data: {
                        parentDrawingShape,
                        cornerId: radiusInfo.id,
                        selectedCornerRadiusOnCard,
                    },
                });
                canvas.add(circle);
            });
    },

    removeObjectByName: (canvas: fabric.Canvas, name: string, strictMode = false): void => {
        const targetList = strictMode
            ? canvas.getObjects().filter((obj) => obj.name === name)
            : canvas.getObjects().filter((obj) => obj.name?.toLocaleLowerCase().includes(name));
        targetList.map((obj) => canvas.remove(obj));
    },

    wrapCanvasText: (
        rawText: fabric.Text,
        canvas: fabric.Canvas,
        maxW: number,
        maxH: number,
        justify: string,
    ): fabric.Text => {
        if (typeof maxH === 'undefined') {
            maxH = 0;
        }

        if (!rawText.text) return rawText;

        const words = rawText.text.split(' ');
        let formatted = '';

        // This works only with monospace fonts
        justify = justify || 'left';

        // clear newlines
        const sansBreaks = rawText.text.replace(/(\r\n|\n|\r)/gm, '');
        // calc line height
        const lineHeight =
            new fabric.Text(sansBreaks, {
                fontFamily: rawText.fontFamily,
                fontSize: rawText.fontSize,
            }).height || 0;

        // adjust for vertical offset
        const maxHAdjusted = maxH > 0 ? maxH - lineHeight : 0;
        const context = canvas.getContext();

        context.font = rawText.fontSize + 'px ' + rawText.fontFamily;
        let currentLine = '';
        let breakLineCount = 0;

        let n = 0;
        while (n < words.length) {
            const isNewLine = currentLine == '';
            const testOverlap = currentLine + ' ' + words[n];

            // are we over width?
            const w = context.measureText(testOverlap).width;

            if (w < maxW) {
                // if not, keep adding words
                if (currentLine != '') currentLine += ' ';
                currentLine += words[n];
            } else {
                // if this hits, we got a word that need to be hypenated
                if (isNewLine) {
                    let wordOverlap = '';

                    // test word length until its over maxW
                    for (let i = 0; i < words[n].length; ++i) {
                        wordOverlap += words[n].charAt(i);
                        let withHypeh = wordOverlap + '-';

                        if (context.measureText(withHypeh).width >= maxW) {
                            // add hyphen when splitting a word
                            withHypeh = wordOverlap.substr(0, wordOverlap.length - 2) + '-';
                            // update current word with remainder
                            words[n] = words[n].substr(wordOverlap.length - 1, words[n].length);
                            formatted += withHypeh; // add hypenated word
                            break;
                        }
                    }
                }
                while (justify == 'right' && context.measureText(' ' + currentLine).width < maxW)
                    currentLine = ' ' + currentLine;

                while (justify == 'center' && context.measureText(' ' + currentLine + ' ').width < maxW)
                    currentLine = ' ' + currentLine + ' ';

                formatted += currentLine + '\n';
                breakLineCount++;
                currentLine = '';
                n++; // was stuck in infinite loop without this

                continue; // restart cycle
            }
            if (maxHAdjusted > 0 && breakLineCount * lineHeight > maxHAdjusted) {
                // add ... at the end indicating text was cutoff
                formatted = formatted.substr(0, formatted.length - 3) + '...\n';
                currentLine = '';
                break;
            }
            n++;
        }

        if (currentLine != '') {
            while (justify == 'right' && context.measureText(' ' + currentLine).width < maxW)
                currentLine = ' ' + currentLine;

            while (justify == 'center' && context.measureText(' ' + currentLine + ' ').width < maxW)
                currentLine = ' ' + currentLine + ' ';

            formatted += currentLine + '\n';
            breakLineCount++;
            currentLine = '';
        }

        // get rid of empy newline at the end
        formatted = formatted.substr(0, formatted.length - 1);

        const ret = new fabric.Text(formatted, {
            // return new text-wrapped text obj
            left: rawText.left,
            top: rawText.top,
            fill: rawText.fill,
            fontFamily: rawText.fontFamily,
            fontSize: rawText.fontSize,
            originX: rawText.originX,
            originY: rawText.originY,
            angle: rawText.angle,
            selectable: false,
            name: `${CANVAS_OBJECT_TYPE_PREFIX.EDGE_NAME}`,
        });
        return ret;
    },
};

export default drawingTool;
