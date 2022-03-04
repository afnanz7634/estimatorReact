import { CANVAS_OBJECT_TYPE_PREFIX, DEFAULT_DEPTH, QUARTERPART_NAME } from '@common/constants';
import { LineDirection } from '@common/enums';
import { DIRECTION } from '@common/enums/drawing-types.enum';
import { ArrowInfo, CornerInfo, DrawingShape, LineSegment, Skeleton, SkeletonSeg } from '@common/models';
import { fabric } from 'fabric';
import { IObjectOptions } from 'fabric/fabric-impl';
import { useCallback } from 'react';
import Vec2 from 'vec2';
import {
    COORDS_EPSILON,
    FREEDRAWER_REALTIMELENGTH_OFFSET,
    NORMALIZE_ARROW,
    OFFSET_HIGHLIGHT_BORDER,
    OFFSET_MEASUREMENT,
    OFFSET_MEASUREMENT_TEXT,
} from './canvas-settings';
import { get025Rounds, MathFunctions, SimpleLine } from './math-helper';

export const cleanSkeletonPoints = (sk: Skeleton): Skeleton | undefined => {
    let deDupe = sk.filter((s, i, a) => {
        if (i === 0) return true;
        if (i === a.length - 1 && MathFunctions.pointsAreEqual(a[0].pos, s.pos)) {
            return false;
        }
        if (i > 0 && MathFunctions.pointsAreEqual(a[i - 1].pos, s.pos)) {
            return false;
        }
        return true;
    });

    while (deDupe) {
        // started empty or reduced to a single point, it's an invalid skeleton
        if (!deDupe || deDupe.length == 1) return undefined;
        // if < 3 points, no further optimization can be done
        if (deDupe.length < 3) return deDupe;

        const removals: Set<number> = new Set();
        for (let i = 0; i < deDupe.length - 2; i++) {
            const [a, b, c] = [deDupe[i].pos, deDupe[i + 1].pos, deDupe[i + 2].pos];
            // if next three points are all horizontal or vertical and in the same line, remove the middle one
            if (
                ((a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y)) &&
                MathFunctions.lineContainsPoint(new SimpleLine(a, c), b, true, true)
            ) {
                removals.add(i + 1);
            }
        }

        if (removals.size === 0) {
            return deDupe;
        }

        deDupe = deDupe.filter((value, index) => {
            return !removals.has(index);
        });
    }
    return undefined;
};

export const getOutlinePts = (sk: Skeleton): Array<Partial<CornerInfo>> | undefined => {
    if (!sk || sk.length < 2) {
        return;
    }

    const points = [];

    for (let i = 1; i < sk.length; i++) {
        const startPt = new Vec2(sk[i - 1].pos.x, sk[i - 1].pos.y);
        const endPt = new Vec2(sk[i].pos.x, sk[i].pos.y);

        let U = new Vec2(0, 0),
            V = new Vec2(0, 0);

        const diffVec = endPt.subtract(startPt, true);
        const normalVec = diffVec.normalize(true).rotate(Math.PI / 2, undefined, true);

        const dPrev = sk[i - 1].depth;

        let angle;

        if (i == 1) {
            U = startPt.add(normalVec.multiply(dPrev, true), true);
            V = startPt.subtract(normalVec.multiply(dPrev, true), true);

            points.push(
                {
                    coords: U,
                    skIndex: i - 1,
                    isUpper: true,
                    angle,
                },
                {
                    coords: V,
                    skIndex: i - 1,
                    isUpper: false,
                    angle,
                },
            );
        }

        if (i == sk.length - 1) {
            U = endPt.add(normalVec.multiply(dPrev, true), true);
            V = endPt.subtract(normalVec.multiply(dPrev, true), true);
        } else {
            const nextPt = new Vec2(sk[i + 1].pos.x, sk[i + 1].pos.y);
            const nextDiffVec = nextPt.subtract(endPt, true);

            const dNext = sk[i].depth;
            angle = diffVec.multiply(-1, true).angleTo(nextDiffVec);
            if (angle === undefined || !angle) {
                console.log('Undefined angle:', sk[i], sk[i + 1], diffVec, nextDiffVec);
            }
            const alpha = Math.atan((dPrev * Math.sin(angle)) / (dNext + dPrev * Math.cos(angle)));

            const dirVec = diffVec.normalize(true).rotate(alpha, undefined, true);
            const length = alpha === 0 ? dPrev : dPrev / Math.sin(alpha);

            U = endPt.add(dirVec.multiply(length, true), true);
            V = endPt.subtract(dirVec.multiply(length, true), true);
        }

        points.splice(
            points.length / 2,
            0,
            {
                coords: U,
                skIndex: i,
                isUpper: true,
                angle,
            },
            {
                coords: V,
                skIndex: i,
                isUpper: false,
                angle,
            },
        );
    }

    return points;
};

export const getArrowsFromOutlines = (points: Vec2[]): ArrowInfo[] => {
    const arrows = [];
    const interiorArrows = [];

    const newPoints = points.slice(0);
    newPoints.push(points[0]);

    for (let i = 1; i < newPoints.length; i++) {
        const startPt = newPoints[i - 1];
        const endPt = newPoints[i];

        const arrowShapePoints = getArrowShapeFromSegment(startPt, endPt);
        const length = startPt.subtract(endPt, true).length();

        arrows.push({
            path: arrowShapePoints,
            isInterior: false,
            length: get025Rounds(length),
        });
    }

    const interiorSegments = getInteriorDepthCurves(points);

    for (let i = 0; i < interiorSegments.length; i++) {
        const arrowShapePoints = getArrowShapeFromSegment(interiorSegments[i][0], interiorSegments[i][1], true);
        const length = interiorSegments[i][0].subtract(interiorSegments[i][1], true).length();
        arrows.push({
            path: arrowShapePoints,
            isInterior: true,
            length: get025Rounds(length),
        });
    }

    return arrows;
};

export const getBacksplashArrowsFromOutlines = (points: Vec2[], label: string): ArrowInfo[] => {
    const arrows = [];

    const newPoints = points.slice(0);
    newPoints.push(points[0]);

    const ltPoint = 0;
    const rtPoint = 1;
    const rbPoint = 2;
    const lbPoint = 3;
    for (let i = 1; i < newPoints.length; i++) {
        const startPt = newPoints[i - 1];
        const endPt = newPoints[i];

        if (startPt !== newPoints[rbPoint] && endPt !== newPoints[lbPoint]) {
            let backsplashLetter = '';
            const arrowShapePoints = getArrowShapeFromSegment(startPt, endPt);

            if (startPt === newPoints[ltPoint] && endPt === newPoints[rtPoint]) backsplashLetter = label;
            arrows.push({ path: arrowShapePoints, label: backsplashLetter });
        }
    }

    return arrows;
};

const getInteriorDepthCurves = (points: Vec2[]): Vec2[][] => {
    const arrows = [];

    const length = points.length;

    if (length <= 6) return [];

    for (let i = 1; i < length / 2 - 2; i++) {
        let depth = DEFAULT_DEPTH; //default depth;
        const firstEdge = points[i + 1].subtract(points[i], true);

        const normalVec = firstEdge.normalize(true).rotate(Math.PI / 2);
        const diaVec = points[i + 1].subtract(points[length - i - 2], true);

        depth = Math.abs(normalVec.x * diaVec.x + normalVec.y * diaVec.y);

        const midPt = points[i + 1].add(points[i], true).multiply(0.5);

        const secondPt = midPt.subtract(normalVec.multiply(depth, true), true);

        arrows.push([midPt, secondPt]);
    }

    return arrows;
};

const getArrowShapeFromSegment = (startPt: Vec2, endPt: Vec2, isInterior?: boolean): Vec2[] => {
    const arrowPoints = [];
    const diffVec = endPt.subtract(startPt, true).normalize();

    const normalVec = diffVec.rotate(Math.PI / 2, undefined, true);

    const offset = isInterior ? 0 : OFFSET_MEASUREMENT;
    const U = startPt.add(normalVec.multiply(offset, true), true);
    const V = endPt.add(normalVec.multiply(offset, true), true);

    arrowPoints.push(U, V);

    let topArrowPt = U.add(diffVec.rotate(Math.PI / 4, undefined, true).multiply(NORMALIZE_ARROW), true);
    let bottomArrowPt = U.add(diffVec.rotate(-Math.PI / 4, undefined, true).multiply(NORMALIZE_ARROW), true);

    arrowPoints.push(topArrowPt, U, bottomArrowPt);

    topArrowPt = V.add(diffVec.rotate((Math.PI * 3) / 4, undefined, true).multiply(NORMALIZE_ARROW), true);
    bottomArrowPt = V.add(diffVec.rotate((-Math.PI * 3) / 4, undefined, true).multiply(NORMALIZE_ARROW), true);

    arrowPoints.push(topArrowPt, V, bottomArrowPt);

    return arrowPoints;
};

export const getDirection = (line: LineSegment): string => {
    const diffVec = line.endPoint.subtract(line.startPoint, true);

    let direction = LineDirection.TOP;

    if (Math.abs(diffVec.y) < Math.abs(diffVec.x) * 0.0875) {
        //Above condition is for checking which direction current edge is laid towards, more likely towards the xAxis or yAxis
        //With this information, we will put measurement text horizontally or vertically
        // In other words, the case for angle between the diff vector and x axis is less than 5'
        if (diffVec.x > 0) {
            direction = LineDirection.BOTTOM;
        } else {
            direction = LineDirection.TOP;
        }
    } else {
        if (diffVec.y < 0) {
            if (Math.abs(diffVec.x) < COORDS_EPSILON) {
                direction = LineDirection.VERTICAL_RIGHT;
            } else direction = LineDirection.RIGHT;
        } else {
            if (Math.abs(diffVec.x) < COORDS_EPSILON) {
                direction = LineDirection.VERTICAL_LEFT;
            } else direction = LineDirection.LEFT;
        }
    }

    return direction;
};

/**
 * func getHighlightPoints
 * To get expanded outlines for highlights from existing outline of a drawing shape
 * so that it won't overlap eachother.
 *
 * Steps for this algorithm:
 * 1. For each vertex i in existing outline, take nested 2 points like i-1, i+1, and
 *  construct incoming vector {i, i-1} and outcoming vector {i, i+1}
 * 2. With these 2 vectors, get sum vector of them and this will be the direction where
 *  current vertex will be expanded.
 * 3. Use a certain expanding factor and position current vertex, this will be the highlight point.
 */
export const getHighlightPoints = (dShape: DrawingShape): Vec2[] => {
    const highlightPoints = [];

    let beforeVec = new Vec2(0, 0),
        afterVec = new Vec2(0, 0),
        dirVec = new Vec2(0, 0);

    const outlines = getOutlinePointsFromShape(dShape);

    for (let i = 0; i < outlines.length; i++) {
        if (i == 0) {
            beforeVec = outlines[i].subtract(outlines[outlines.length - 1], true);
            afterVec = outlines[i].subtract(outlines[i + 1], true);
        } else if (i == outlines.length - 1) {
            beforeVec = outlines[i].subtract(outlines[i - 1], true);
            afterVec = outlines[i].subtract(outlines[0], true);
        } else {
            beforeVec = outlines[i].subtract(outlines[i - 1], true);
            afterVec = outlines[i].subtract(outlines[i + 1], true);
        }

        beforeVec.normalize();
        afterVec.normalize();

        dirVec = beforeVec.add(afterVec, true).normalize();

        const normalVec = beforeVec.rotate(Math.PI / 2, undefined, true);

        if (normalVec.x * dirVec.x + normalVec.y * dirVec.y < 0) {
            dirVec.multiply(-1);
        }

        const newPt = outlines[i].add(dirVec.multiply(OFFSET_HIGHLIGHT_BORDER), true);

        highlightPoints.push(newPt);
    }

    return highlightPoints;
};
export const getCornerLabelPosition = (
    beforePos: Vec2,
    currentPos: Vec2,
    afterPos: Vec2,
    textW: number,
    textH: number,
): Vec2 => {
    let pos = new Vec2(0, 0);

    // use before and after vectors of the current vector to get the sum of the 2 vectors
    // this sum will give the direction  of the corner measurement

    const beforeVec = currentPos.subtract(beforePos, true).normalize();
    const afterVec = currentPos.subtract(afterPos, true).normalize();

    const dirVec = beforeVec.add(afterVec, true).normalize();

    const normalVec = beforeVec.rotate(Math.PI / 2, undefined, true);

    if (normalVec.x * dirVec.x + normalVec.y * dirVec.y < 0) {
        dirVec.multiply(-1);
    }

    const diffVec = dirVec.multiply(OFFSET_MEASUREMENT_TEXT, true);
    pos = currentPos.add(diffVec, true);

    const part_name = getQuarterPart(dirVec);

    // shift the corner measurement dependeing in which quarters the initial point is
    switch (part_name) {
        case QUARTERPART_NAME.POS_X_AXIS:
            pos.set(pos.x, pos.y - textH * 0.5, false);
            break;
        case QUARTERPART_NAME.NEG_X_AXIS:
            pos.set(pos.x - textW, pos.y - textH * 0.5, false);
            break;
        case QUARTERPART_NAME.POS_Y_AXIS:
            pos.set(pos.x - textW * 0.5, pos.y, false);
            break;
        case QUARTERPART_NAME.NEG_Y_AXIS:
            pos.set(pos.x - textW * 0.5, pos.y - textH, false);
            break;
        case QUARTERPART_NAME.QAURTER_1:
            pos.set(pos.x, pos.y - textH, false);
            break;
        case QUARTERPART_NAME.QAURTER_2:
            pos.set(pos.x, pos.y, false);
            break;
        case QUARTERPART_NAME.QAURTER_3:
            pos.set(pos.x - textW, pos.y, false);
            break;
        case QUARTERPART_NAME.QAURTER_4:
            pos.set(pos.x - textW, pos.y - textH, false);
            break;
        default:
            break;
    }
    return pos;
};

export const getQuarterPart = (vec: Vec2): string => {
    let part_name = '';
    const { x, y } = vec;

    if (Math.abs(y) < Math.abs(x) * 0.0875) {
        if (x >= 0) part_name = QUARTERPART_NAME.POS_X_AXIS;
        else if (x < 0) part_name = QUARTERPART_NAME.NEG_X_AXIS;
    } else if (Math.abs(x) < Math.abs(y) * 0.0875) {
        if (y >= 0) part_name = QUARTERPART_NAME.POS_Y_AXIS;
        else if (y < 0) part_name = QUARTERPART_NAME.NEG_Y_AXIS;
    } else {
        if (x > 0 && y < 0) {
            part_name = QUARTERPART_NAME.QAURTER_1;
        } else if (x > 0 && y > 0) {
            part_name = QUARTERPART_NAME.QAURTER_2;
        } else if (x < 0 && y > 0) {
            part_name = QUARTERPART_NAME.QAURTER_3;
        } else {
            part_name = QUARTERPART_NAME.QAURTER_4;
        }
    }

    return part_name;
};

export const getOutlinePointsFromShape = (dShape: DrawingShape): Array<Vec2> => {
    if (!dShape?.cornerMap) return [];
    return Object.values(dShape.cornerMap).map((corner) => corner.coords);
};

export const getRefinedEdgePoints = ([startX, startY, endX, endY]: Array<number>, stroke?: number) => {
    const offset = stroke ? stroke * 0.5 : 0;
    return [startX - offset, startY - offset, endX - offset, endY - offset];
};

export const MakeNewPoint = (points: Array<Vec2>, defaultW: number): ((idx: number, pt: Vec2) => Vec2 | null) => {
    /**
     * This module restrict the free drawing to keep vertical or horizontal direction
     * If the offest between previous and current points is bigger than the half of the default width,
     * then we change the direction. Or we keep the direction.
     * Also, when we change the direction, we add extra point as a middle point.
     */
    const useMakeNewPointCB = useCallback(
        (idx: number, pt: Vec2) => {
            let newPt = null;
            if (!points[idx]) return newPt;
            if (Math.abs(points[idx].x - pt.x) >= defaultW / 2) {
                newPt = new Vec2(pt.x, points[idx].y);
            } else if (Math.abs(points[idx].y - pt.y) >= defaultW / 2) {
                newPt = new Vec2(points[idx].x, pt.y);
            } else if (points.length < 2 || (points.length === 2 && idx === 0)) {
                if (Math.abs(points[0].x - pt.x) > Math.abs(points[0].y - pt.y)) {
                    newPt = new Vec2(pt.x, points[0].y);
                } else {
                    newPt = new Vec2(points[0].x, pt.y);
                }
            }
            return newPt;
        },
        [points],
    );

    return useMakeNewPointCB;
};

export const FreeDrawerRealTimeLength = (points: Array<Vec2>): { length: number; pos: Vec2 } => {
    let length = FREEDRAWER_REALTIMELENGTH_OFFSET; // changed from 0.0 for EE-917 and EE-920
    let dirVec = new Vec2(0, 0);
    for (let i = 1; i < points.length; i++) {
        const diff = points[i].subtract(points[i - 1], true);
        const d = diff.length();
        length += d;
        if (i == points.length - 1) {
            dirVec = diff.normalize(true);
        }
    }

    const roundedValue = get025Rounds(length);
    const newPos = points[points.length - 1].add(dirVec.multiply(FREEDRAWER_REALTIMELENGTH_OFFSET, true));

    return { length: roundedValue, pos: newPos };
};

export const generateSkeletonData = (points: Array<Vec2>, depth: number): Skeleton => {
    const skData = points.map((pt: Vec2) => {
        return {
            pos: {
                x: pt.x,
                y: pt.y,
            },
            depth,
        } as SkeletonSeg;
    });

    return skData;
};

// Get upper, bottom, left, right direction vector for given vector
export const isCorrectDirection = (vec: Vec2, direction: string): boolean => {
    let result = true;
    let dirVec = new Vec2(1, 0);
    switch (direction) {
        case DIRECTION.UP:
            dirVec = new Vec2(0, -1);
            break;
        case DIRECTION.DOWN:
            dirVec = new Vec2(0, 1);
            break;
        case DIRECTION.LEFT:
            dirVec = new Vec2(-1, 0);
            break;
        case DIRECTION.RIGHT:
            dirVec = new Vec2(1, 0);
            break;
    }

    if (vec.x * dirVec.x + vec.y * dirVec.y <= 0) {
        result = false;
    }

    return result;
};
// construct another polygon from existing outline points of active drawing shape
// in case this is needed again for select shape functionality
const getHighlightedPolygonForExistingShape = (canvas: any, activeDrawingShape: DrawingShape) => {
    if (!activeDrawingShape.highlightPoints) {
        activeDrawingShape.highlightPoints = getHighlightPoints(activeDrawingShape);
    }

    const opt: IObjectOptions = {
        fill: 'transparent',
        selectable: false,
        stroke: 'grey',
        strokeWidth: 0.8,
        name: CANVAS_OBJECT_TYPE_PREFIX.ACTIVE_SHAPE_HIGHLIGHTS,
    };

    const outline = new fabric.Polygon(activeDrawingShape.highlightPoints!, opt);
    canvas.add(outline);
    canvas.sendToBack(outline);
};

export const isPointInsidePolygon = (shape: DrawingShape, testPoint: Vec2): boolean => {
    // built for EE-937
    // grab the corner points out of the shape
    let cornerCoords: Vec2[];
    cornerCoords = getOutlinePointsFromShape(shape);
    let intersectionCount = 0;
    // run through all point pairs on the polygon (segment edges)
    for (let c = 0; c < cornerCoords.length; c++) {
        let nextCorner;
        if (c === cornerCoords.length - 1) {
            nextCorner = cornerCoords[0];
        } else {
            nextCorner = cornerCoords[c + 1];
        }

        // test whether the selected point has a vector (imaginary) that intersects the side between the corners
        if (
            !(
                (testPoint.y > cornerCoords[c].y && testPoint.y > nextCorner.y) ||
                (testPoint.y < cornerCoords[c].y && testPoint.y < nextCorner.y) ||
                (testPoint.x > cornerCoords[c].x && testPoint.x > nextCorner.x)
            )
        ) {
            intersectionCount++;
        }
    }

    // if an even number of intersections are found, the point is not inside the polygon
    if (intersectionCount % 2 == 0) {
        return false;
    }

    // if an odd number of intersections are found, the point IS inside the polygon
    return true;
};
