import Vec2 from 'vec2';
import { MathFunctions } from '../utils/math-helper';

export const getLetterStartIndex = (points: Vec2[]) => {
    let minTop = Number.MAX_SAFE_INTEGER;
    let minTopIndex = 0;

    for (let i = 1; i < points.length; i++) {
        const startPt = points[i - 1],
            endPt = points[i];
        const midPt = MathFunctions.getMidpoint(startPt, endPt);

        if (midPt.y < minTop) {
            minTop = midPt.y;
            minTopIndex = i - 1;
        }
    }

    return minTopIndex;
};
