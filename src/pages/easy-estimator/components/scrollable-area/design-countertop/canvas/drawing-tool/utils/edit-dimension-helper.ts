import { ArrowInfo, DrawingShape } from '@common/models';
import Vec2 from 'vec2';
import drawingTool from '../../../drawer/drawingTool';
import { findArrowByEdgeId, findDrawingEdgeById } from './drawing-shape-helper';
import { MathFunctions } from './math-helper';
import { isCorrectDirection } from './shape-helper';
import { DIRECTION } from '@common/enums/drawing-types.enum';

export const updateShapeByEdge = (arrowInfo: ArrowInfo, shape: DrawingShape): void => {
    const edge = findDrawingEdgeById(arrowInfo.drawingEdgeId!, shape);

    if (!edge) return;

    const arrow = findArrowByEdgeId(edge.id, shape);

    if (!arrow) return;

    if (arrowInfo.length === arrow.length) return;

    const diff = arrowInfo.length! - arrow.length!;
    let skData = shape.skeleton.slice();
    const skLength = skData.length;

    const startSkId = shape.cornerMap[edge.startCornerId].skIndex;
    const endSkId = shape.cornerMap[edge.endCornerId].skIndex;
    const vec2StartSkPt = new Vec2(skData[startSkId].pos.x, skData[startSkId].pos.y);
    const vec2EndSkPt = new Vec2(skData[endSkId].pos.x, skData[endSkId].pos.y);
    let dirVec = edge.dirVec.normalize(); // fix for end edge edit multiplication problem
    let newStartSkPt = new Vec2(vec2StartSkPt.x, vec2StartSkPt.y);
    let newEndSkPt = new Vec2(vec2EndSkPt.x, vec2EndSkPt.y);

    if (skLength == 2 && startSkId === endSkId) {
        // This is for simple shape - Rectangle AND it's a change to an end edge
        // Got rid of half of the code that handles just a rectangle, it was not recreating vectors correctly
        // for side edges (non end edges)
        let depth = skData[0].depth;
        if (!isCorrectDirection(dirVec, DIRECTION.DOWN)) {
            dirVec.multiply(-1);
        }
        newStartSkPt = new Vec2(skData[0].pos.x, skData[0].pos.y).add(dirVec.multiply(diff * 0.5, true), true);
        newEndSkPt = new Vec2(skData[1].pos.x, skData[1].pos.y).add(dirVec.multiply(diff * 0.5, true), true);
        depth = arrowInfo.length! * 0.5;

        skData = [
            {
                pos: newStartSkPt,
                depth,
            },
            {
                pos: newEndSkPt,
                depth,
            },
        ];
    } else {
        if (startSkId === endSkId) {
            //means the edge is one of two end edges
            const depth = arrowInfo.length! * 0.5;

            // get the next skeletal point from the edge
            const midSkPt =
                startSkId === skLength - 1
                    ? new Vec2(skData[skLength - 2].pos.x, skData[skLength - 2].pos.y)
                    : new Vec2(skData[startSkId + 1].pos.x, skData[startSkId + 1].pos.y);

            // get one further skeletal point from the edge
            const nextSkPt =
                startSkId === skLength - 1
                    ? new Vec2(skData[skLength - 3].pos.x, skData[skLength - 3].pos.y)
                    : new Vec2(skData[startSkId + 2].pos.x, skData[startSkId + 2].pos.y);

            // determine if the first turn on the shape bends to the left or the right from the perspective of the edge looking back at the shape
            const skTurn =
                (midSkPt.x - vec2StartSkPt.x) * (nextSkPt.y - vec2StartSkPt.y) -
                    (midSkPt.y - vec2StartSkPt.y) * (nextSkPt.x - vec2StartSkPt.x) >
                0
                    ? 1 // "left"
                    : -1; // "right"

            // get the new starting point (on this edge) considering the edge's direction, change in magnitude/2, and whether the shape bends left or right heading into the shape
            newStartSkPt = vec2StartSkPt.subtract(dirVec.multiply(diff * 0.5 * skTurn, true), true);

            const dirVecFirst = midSkPt.subtract(vec2StartSkPt, true).normalize();
            const dirVecSecond = nextSkPt.subtract(midSkPt, true).normalize();
            const intersectionPt = MathFunctions.getInterceptPoint(
                newStartSkPt,
                dirVecFirst,
                nextSkPt,
                dirVecSecond,
                true,
            );
            if (intersectionPt) {
                newEndSkPt = intersectionPt;
                skData.splice(startSkId, 1, {
                    pos: newStartSkPt,
                    depth,
                });

                const nextIndex = startSkId === skLength - 1 ? startSkId - 1 : 1;
                skData.splice(nextIndex, 1, {
                    pos: newEndSkPt,
                    depth: startSkId === skLength - 1 ? depth : skData[nextIndex].depth,
                });
            } else {
                console.error('Error occured during getting new skeleton point');
            }
        } else if (startSkId === 0 || startSkId === skLength - 1) {
            let nextSkPt: Vec2;
            if (startSkId === 0) {
                nextSkPt = new Vec2(skData[1].pos.x, skData[1].pos.y);
            } else {
                nextSkPt = new Vec2(skData[skLength - 2].pos.x, skData[skLength - 2].pos.y);
            }

            dirVec = newStartSkPt.subtract(nextSkPt, true).normalize();
            newStartSkPt = newStartSkPt.add(dirVec.multiply(diff, true), true);

            skData.splice(startSkId, 1, {
                pos: newStartSkPt,
                depth: skData[startSkId].depth,
            });
        } else if (endSkId === 0 || endSkId === skLength - 1) {
            let nextSkPt: Vec2;
            if (endSkId == 0) {
                nextSkPt = new Vec2(skData[1].pos.x, skData[1].pos.y);
            } else {
                nextSkPt = new Vec2(skData[skLength - 2].pos.x, skData[skLength - 2].pos.y);
            }
            dirVec = newEndSkPt.subtract(nextSkPt, true).normalize();
            newEndSkPt = newEndSkPt.add(dirVec.multiply(diff, true), true);
            skData.splice(endSkId, 1, {
                pos: newEndSkPt,
                depth: skData[endSkId].depth,
            });
        } else {
            //In this case, we move all following or previous sk points towards the diff direction
            dirVec = vec2EndSkPt.subtract(vec2StartSkPt, true).normalize();

            if (isCorrectDirection(dirVec, DIRECTION.DOWN) || isCorrectDirection(dirVec, DIRECTION.RIGHT)) {
                const step = startSkId < endSkId ? 1 : -1;
                let i = endSkId;
                while (i >= 0 && i < skLength) {
                    const newPt = new Vec2(skData[i].pos.x, skData[i].pos.y).add(dirVec.multiply(diff, true));
                    skData.splice(i, 1, {
                        pos: newPt,
                        depth: skData[i].depth,
                    });
                    i += step;
                }
            } else {
                const step = startSkId < endSkId ? -1 : 1;
                let i = startSkId;
                while (i >= 0 && i < skLength) {
                    const newPt = new Vec2(skData[i].pos.x, skData[i].pos.y).add(dirVec.multiply(diff * -1, true));
                    skData.splice(i, 1, {
                        pos: newPt,
                        depth: skData[i].depth,
                    });
                    i += step;
                }
            }
        }
    }

    drawingTool.rebuildShapeFromNewSkeleton(skData, shape);
    return;
};

export const updateShapeByTranslation = (moveVec: Vec2, shape: DrawingShape): void => {
    // called whenever a user moves a shape on the canvas
    const skData = shape.skeleton.slice();
    const skLength = skData.length;

    let i = 0;
    while (i >= 0 && i < skLength) {
        const newPt = new Vec2(skData[i].pos.x, skData[i].pos.y).subtract(moveVec);
        skData.splice(i, 1, {
            pos: newPt,
            depth: skData[i].depth,
        });
        i += 1;
    }

    drawingTool.rebuildShapeFromNewSkeleton(skData, shape);
    return;
};
