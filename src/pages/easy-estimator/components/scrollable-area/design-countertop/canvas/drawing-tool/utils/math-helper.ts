import Vec2 from 'vec2';

export const reverseVector = (vector: Vec2): Vec2 => {
    if (!vector) {
        return new Vec2(0, 0);
    }
    return new Vec2(-vector.x, -vector.y);
};

export const getMidpoint = (p1: Vec2, p2: Vec2): Vec2 => {
    // 2d:
    if (!p2) {
        return p1;
    }
    if (!p1) {
        return p2;
    }
    return new Vec2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
};

export const isHorizontallyAligned = (p1: Vec2, p2: Vec2, round?: boolean): boolean => {
    const y1 = p1.y;
    const y2 = p2.y;
    if (round) {
        return Math.round(y1) === Math.round(y2);
    }
    return y1 === y2;
};

export const isVerticallyAligned = (p1: Vec2, p2: Vec2, round?: boolean): boolean => {
    const x1 = p1.x;
    const x2 = p2.x;
    if (round) {
        return Math.round(x1) === Math.round(x2);
    }
    return x1 === x2;
};

// Line Segment Formula
export const getLineSegmentLength = (point1: Vec2, point2: Vec2): number => {
    const vector = MathFunctions.getVectorBetweenPoints(point1, point2);
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
};

export const getTopLeftVector = (vectors: Array<Vec2>): Vec2 => {
    let tl = vectors[0];
    // -0.15 is fault tolerance on points coordinates
    const faultTolerance = 0.15;

    /*
 //Need to improve more
 vectors.forEach((v: Vec2) => {
     const diffY = Math.abs(tl.y) - Math.abs(v.y);
     if ((tl.y > 0 && v.y < 0) || (tl.y > v.y && (diffY > faultTolerance || diffY < -faultTolerance))) {
         tl = v;
     } else if (tl.x > 0 && v.x < 0) {
         tl = v;
     } else if (tl.x > v.x && diffY < faultTolerance) {
         const diffX = Math.abs(tl.x) - Math.abs(v.x);
         if (diffX > faultTolerance) {
             tl = v;
         }
     }
 });*/

    vectors.forEach((v: Vec2) => {
        if (v.y < tl.y - faultTolerance) {
            tl = v;
        } else if (Math.abs(v.y - tl.y) < faultTolerance && v.x < tl.x) {
            tl = v;
        }
    });

    return tl;
};

export const get025Rounds = (value: number): number => {
    return Math.round(value * 4) / 4;
};

export const convertFromRadiansToDegree = (angle: number): number => {
    return (angle * 180.0) / Math.PI;
}

export class SimplePoint {
    x: number;
    y: number;

    constructor(xLoc: number, yLoc: number) {
        if (xLoc == null) {
            this.x = 0;
            this.y = 0;
        } else {
            this.x = xLoc;
            this.y = yLoc;
        }
    }
}

export class SimpleLine {
    point1: Vec2;
    point2: Vec2;

    constructor(p1: Vec2, p2: Vec2) {
        this.point1 = new Vec2(p1.x, p1.y);
        this.point2 = new Vec2(p2.x, p2.y);
    }
}

export class SimpleSize {
    width: number;
    height: number;

    constructor(myWidth: number, myHeight: number) {
        this.width = myWidth;
        this.height = myHeight;
    }
}

export class SimpleShape {
    line1: SimpleLine;
    line2: SimpleLine;
    line3: SimpleLine;
    line4: SimpleLine;

    constructor(l1: SimpleLine, l2: SimpleLine, l3: SimpleLine, l4: SimpleLine) {
        this.line1 = l1;
        this.line2 = l2;
        this.line3 = l3;
        this.line4 = l4;
    }
}

export class SimpleSegment {
    point: number[] | undefined;
    handleIn: number[] | undefined;
    handleOut: number[] | undefined;

    constructor(point: Vec2, handleIn: Vec2, handleOut: Vec2) {
        if (point) {
            this.point = [point.x, point.y];
        }
        if (handleIn) this.handleIn = [handleIn.x, handleIn.y];
        if (handleOut) this.handleOut = [handleOut.x, handleOut.y];
    }
}

const MAX_PRECISION = 20;

export class MathFunctions {
    static multiplyVectorByScalar(v: Vec2, s: number): Vec2 {
        return new Vec2(v.x * s, v.y * s);
    }

    static addVectors(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }

    static deltaVectorFromTwoPoints(v1: Vec2, v2: Vec2, delta: number): Vec2 {
        const diffVec = MathFunctions.getVectorBetweenPoints(v1, v2);
        const magnitude = MathFunctions.getDistanceBetween(v1, v2);
        const deltaVector = MathFunctions.multiplyVectorByScalar(diffVec, delta / magnitude);
        return deltaVector;
    }

    static roundVector(v: Vec2): Vec2 {
        return new Vec2(Math.round(v.x), Math.round(v.y));
    }

    static roundVectorTo(v: Vec2, digits = 0): Vec2 {
        digits = Math.round(digits);
        if (Math.abs(digits) > MAX_PRECISION) {
            digits = Math.sign(digits) * MAX_PRECISION;
        }
        const scale = 10 ** digits;
        return new Vec2(Math.round(v.x * scale) / scale, Math.round(v.y * scale) / scale);
    }

    static roundTo(n: number, digits = 0): number {
        digits = Math.round(digits);
        if (Math.abs(digits) > MAX_PRECISION) {
            digits = Math.sign(digits) * MAX_PRECISION;
        }
        const scale = 10 ** digits;
        return (n * scale) / scale;
    }

    static getVectorBetweenPoints(p1: Vec2, p2: Vec2): Vec2 {
        return new Vec2(p2.x - p1.x, p2.y - p1.y);
    }

    static getDistanceBetween(p1: Vec2, p2: Vec2): number {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    static getMidpoint(p1: Vec2, p2: Vec2): Vec2 {
        //2d:
        if (!p2) {
            return p1;
        }
        if (!p1) {
            return p2;
        }
        return new Vec2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    }

    static isHorizontallyAligned(p1: Vec2, p2: Vec2, round?: boolean): boolean {
        const y1 = p1.y;
        const y2 = p2.y;
        if (round) {
            return Math.round(y1) === Math.round(y2);
        }
        return y1 === y2;
    }

    static isVerticallyAligned(p1: Vec2, p2: Vec2, round?: boolean): boolean {
        const x1 = p1.x;
        const x2 = p2.x;
        if (round) {
            return Math.round(x1) === Math.round(x2);
        }
        return x1 === x2;
    }

    static isHorizontallyOrVerticallyAligned(p1: Vec2, p2: Vec2): boolean {
        return MathFunctions.isHorizontallyAligned(p1, p2) || MathFunctions.isVerticallyAligned(p1, p2);
    }

    static getUnitNormal(p1: Vec2, p2: Vec2): Vec2 {
        if (MathFunctions.isVerticallyAligned(p1, p2)) {
            return new Vec2(MathFunctions.normalizeOneDimensional(p2.y - p1.y), 0);
        }
        if (MathFunctions.isHorizontallyAligned(p1, p2)) {
            return new Vec2(0, MathFunctions.normalizeOneDimensional(p2.x - p1.x));
        }
        const slope = -((p2.x - p1.x) / (p2.y - p1.y));
        return MathFunctions.normalizeTwoDimensionalSlop(slope);
    }

    static normalizeOneDimensional(length: number): number {
        if (length > 0) {
            return 1;
        }
        if (length < 0) {
            return -1;
        }
        return length;
    }

    static normalizeTwoDimensionalSlop(slop: number): Vec2 {
        return MathFunctions.normalizeTwoDimensional(new Vec2(1, slop));
    }

    static normalizeTwoDimensional(vector: Vec2): Vec2 {
        const length = MathFunctions.getVectorLength(vector);
        if (length === 0) {
            return new Vec2(0, 0);
        }
        return new Vec2(vector.x / length, vector.y / length);
    }

    static projectVector(a: Vec2, b: Vec2): Vec2 {
        return new Vec2(a.x * b.x, a.y * b.y).divide(a.lengthSquared());
    }

    static getScalarLengthAlong(deltaVector: Vec2, basisVector: Vec2): number {
        if (MathFunctions.isZeroVector(deltaVector) || MathFunctions.isZeroVector(basisVector)) {
            return 0;
        }
        deltaVector = MathFunctions.projectVector(deltaVector, basisVector);
        const unsignedLength = MathFunctions.getVectorLength(deltaVector);
        if (
            MathFunctions.isOppositeSign(deltaVector.x, basisVector.x) ||
            MathFunctions.isOppositeSign(deltaVector.y, basisVector.y)
        ) {
            return -1 * unsignedLength;
        }
        return unsignedLength;
    }

    static getScalarLengthAlongMatchingLinearVector(deltaVector: Vec2, basisVector: Vec2): number {
        if (MathFunctions.isZeroVector(deltaVector) || MathFunctions.isZeroVector(basisVector)) {
            return 0;
        }
        const unsignedLength = MathFunctions.getVectorLength(deltaVector);
        if (
            MathFunctions.isOppositeSign(deltaVector.x, basisVector.x) ||
            MathFunctions.isOppositeSign(deltaVector.y, basisVector.y)
        ) {
            return -1 * unsignedLength;
        }
        return unsignedLength;
    }

    static getVectorLength(vector: Vec2): number {
        return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
    }

    static isOppositeSign(a: number, b: number): boolean {
        return (a > 0 && b < 0) || (a < 0 && b > 0);
    }

    static pointsAreEqual(p1: Vec2, p2: Vec2): boolean {
        return p1.x === p2.x && p1.y === p2.y;
    }

    static transposePoint(p: Vec2): Vec2 {
        return new Vec2(p.y, p.x);
    }

    static reverseVector(v: Vec2): Vec2 {
        if (!v) {
            return new Vec2(0, 0);
        }
        return new Vec2(-v.x, -v.y);
    }

    static getScalarSlope(p1: Vec2, p2?: Vec2): number {
        if (p2) {
            return MathFunctions.getScalarSlope(MathFunctions.getVectorBetweenPoints(p1, p2));
        }
        if (p1.x === 0) {
            return NaN;
        }
        return p1.y / p1.x;
    }

    static isZeroVector(v: Vec2): boolean {
        return v.x === 0 && v.y === 0;
    }

    static linesIntersect(line1: SimpleLine, line2: SimpleLine): boolean {
        const intPoint = MathFunctions.getInterceptPoint(
            MathFunctions.getMidpoint(line1.point1, line1.point2),
            MathFunctions.getVectorBetweenPoints(line1.point1, line1.point2),
            line2.point2,
            MathFunctions.getVectorBetweenPoints(line2.point1, line2.point2),
        );
        if (intPoint != null && isFinite(intPoint.x) && isFinite(intPoint.y)) {
            return (
                MathFunctions.lineContainsLinearPoint(line1, intPoint) &&
                MathFunctions.lineContainsLinearPoint(line2, intPoint)
            );
        }
        return false;
    }

    static lineContainsPoint(line: SimpleLine, point: Vec2, dontRound: boolean, projectLine: boolean): boolean {
        let slopeVector = this.getVectorBetweenPoints(line.point1, line.point2);
        if (!dontRound) {
            slopeVector = this.roundVector(slopeVector);
        }
        if (slopeVector.x === 0) {
            if (projectLine) {
                const ySorted = [point.y, line.point1.y, line.point2.y].sort((a, b) => {
                    return a - b;
                });
                return point.x === line.point1.x && MathFunctions.numberIsBetween(ySorted[1], ySorted[0], ySorted[2]);
            }
            return point.x === line.point1.x && MathFunctions.numberIsBetween(point.y, line.point1.y, line.point2.y);
        }
        const slope = MathFunctions.getScalarSlope(line.point1, line.point2);
        const yInt = MathFunctions.solveForYIntercept(slope, line.point1);
        let yAtX = slope * point.x + yInt; //y = mx+b
        let pointY = point.y;
        if (!dontRound) {
            pointY = Math.round(pointY);
            yAtX = Math.round(yAtX);
        }

        if (!(pointY === yAtX)) {
            return false;
        }
        if (projectLine) {
            return true;
        }
        return MathFunctions.lineContainsLinearPoint(line, point, dontRound);
    }

    static lineContainsLinearPoint(line: SimpleLine, point: Vec2, dontRound?: boolean): boolean {
        const vectorShift = MathFunctions.reverseVector(line.point1);
        let lineVector = MathFunctions.addVectors(line.point2, vectorShift);
        let newLinearPoint = MathFunctions.addVectors(point, vectorShift);
        if (!dontRound) {
            lineVector = MathFunctions.roundVector(lineVector);
            newLinearPoint = MathFunctions.roundVector(newLinearPoint);
        }
        let lineEndsAt = MathFunctions.getVectorLength(lineVector); //0 to that.
        let pointIsAt = MathFunctions.getScalarLengthAlongMatchingLinearVector(newLinearPoint, lineVector);
        if (!dontRound) {
            lineEndsAt = Math.round(lineEndsAt);
            pointIsAt = Math.round(pointIsAt);
        }
        return MathFunctions.numberIsBetween(pointIsAt, 0, lineEndsAt);
    }

    static numberIsBetween(num: number, a: number, b: number): boolean {
        if (a > b) {
            return MathFunctions.numberIsBetween(num, b, a);
        }
        //a <= b:
        return num >= a && num <= b;
    }

    static getInterceptPoint(
        startingPoint: Vec2,
        slopeVector: Vec2,
        interceptLinePoint: Vec2,
        interceptLineSlopeVector: Vec2,
        dontRoundVectors?: boolean,
    ): Vec2 | null {
        //projects intercept line to get an answer.
        if (!dontRoundVectors) {
            return this.getInterceptPoint(
                MathFunctions.roundVector(startingPoint),
                MathFunctions.roundVector(slopeVector.normalize(true)),
                MathFunctions.roundVector(interceptLinePoint),
                MathFunctions.roundVector(interceptLineSlopeVector.normalize(true)),
                true,
            );
        }

        // same points
        if (this.pointsAreEqual(startingPoint, interceptLinePoint)) {
            return startingPoint;
        }

        // parallel lines (including both vertical)
        if (
            this.pointsAreEqual(slopeVector, interceptLineSlopeVector) ||
            (slopeVector.x === 0 && interceptLineSlopeVector.x === 0)
        ) {
            return null;
        }

        // zero interceptSlopeVector, if the starting line contains interceptLinePoint, then interceptLinePoint is the intercept
        if (this.pointsAreEqual(new Vec2(0, 0), interceptLineSlopeVector)) {
            if (
                MathFunctions.lineContainsPoint(
                    {
                        point1: startingPoint,
                        point2: MathFunctions.addVectors(startingPoint, slopeVector),
                    },
                    interceptLinePoint,
                    true,
                    true,
                )
            ) {
                return interceptLinePoint;
            }
            return null;
        }

        // zero slopeVector, same as above, but return startingPoint
        if (this.pointsAreEqual(new Vec2(0, 0), slopeVector)) {
            if (
                MathFunctions.lineContainsPoint(
                    {
                        point1: interceptLinePoint,
                        point2: MathFunctions.addVectors(interceptLinePoint, interceptLineSlopeVector),
                    },
                    startingPoint,
                    true,
                    true,
                )
            ) {
                return startingPoint;
            }
            return null;
        }

        // vertical line, infinite slope,
        if (slopeVector.x === 0) {
            const transposedIntercept = MathFunctions.getInterceptPoint(
                MathFunctions.transposePoint(startingPoint),
                MathFunctions.transposePoint(slopeVector),
                MathFunctions.transposePoint(interceptLinePoint),
                MathFunctions.transposePoint(interceptLineSlopeVector),
                true,
            );
            if (transposedIntercept) {
                return MathFunctions.transposePoint(transposedIntercept);
            }
            return null;
        }

        const slope = MathFunctions.getScalarSlope(slopeVector);
        if (interceptLineSlopeVector.x === 0) {
            const yValue = MathFunctions.solveForYIntercept(
                slope,
                new Vec2(startingPoint.x - interceptLinePoint.x, startingPoint.y),
            );
            return new Vec2(interceptLinePoint.x, yValue);
        }
        const interceptLineSlope = MathFunctions.getScalarSlope(interceptLineSlopeVector);
        if (slope === interceptLineSlope) {
            return null;
        }
        const startingPointYIntercept = MathFunctions.solveForYIntercept(slope, startingPoint);
        const interceptLineYIntercept = MathFunctions.solveForYIntercept(interceptLineSlope, interceptLinePoint);

        const xVal = (interceptLineYIntercept - startingPointYIntercept) / (slope - interceptLineSlope);
        const yVal = slope * xVal + startingPointYIntercept;

        return new Vec2(xVal, yVal);
    }

    static solveForYIntercept(slope: number, point: Vec2): number {
        let pointYIntercept: number;
        if (point.x === 0 || slope === 0) {
            pointYIntercept = point.y;
        } else {
            pointYIntercept = point.y - slope * point.x;
        }
        return pointYIntercept;
    }

    static calculateRadiusFromArc(arcWidth: number, arcDepth: number): number {
        const halfLength = arcWidth / 2;
        return (arcDepth * arcDepth + halfLength * halfLength) / (2 * arcDepth);
    }

    static calculateArcDepth(arcWidth: number, radius: number): number {
        const halfLength = arcWidth / 2;
        const depthRadical = Math.sqrt(radius * radius - halfLength * halfLength);
        return radius - depthRadical;
    }

    static calculateArcLength(arcWidth: number, arcDepth: number): number {
        const halfLength = arcWidth / 2;
        const radius = (arcDepth * arcDepth + halfLength * halfLength) / (2 * arcDepth);
        const angleInRadians = 2 * (Math.PI / 2 - Math.acos(halfLength / radius));
        return angleInRadians * radius;
    }

    static getLineLength(line: SimpleLine): number {
        return MathFunctions.getDistanceBetween(line.point1, line.point2);
    }

    static getLineVector(line: SimpleLine): Vec2 {
        return MathFunctions.getVectorBetweenPoints(line.point1, line.point2);
    }

    static getInterceptBetweenSimpleLines(line1: SimpleLine, line2: SimpleLine, dontRound = false): Vec2 | null {
        return MathFunctions.getInterceptPoint(
            line1.point1,
            MathFunctions.getLineVector(line1),
            line2.point1,
            MathFunctions.getLineVector(line2),
            dontRound,
        );
    }

    static getLineNormal(line: SimpleLine): Vec2 {
        return MathFunctions.getUnitNormal(line.point1, line.point2);
    }

    static getLineMidpoint(line: SimpleLine): Vec2 {
        return MathFunctions.getMidpoint(line.point1, line.point2);
    }

    static isHorizontalLine(line: SimpleLine, round: boolean): boolean {
        return MathFunctions.isHorizontallyAligned(line.point1, line.point2, round);
    }

    static isVerticalLine(line: SimpleLine, round: boolean): boolean {
        return this.isVerticallyAligned(line.point1, line.point2, round);
    }

    static calculateAngleFromLines(lineIn: SimpleLine, lineOut: SimpleLine): number {
        const curve1Point = lineIn.point1;
        const angleVertexPoint = lineIn.point2;
        const curve2Point = lineOut.point2;

        const v1 = MathFunctions.reverseVector(
            MathFunctions.getVectorBetweenPoints(curve1Point, angleVertexPoint),
        ).normalize();
        const v2 = MathFunctions.getVectorBetweenPoints(angleVertexPoint, curve2Point).normalize();
        return v1.angleTo(v2);
    }

    static calculateOutVectorFromAngle(vectorIn: Vec2, angle: number, counterClockwise: boolean): Vec2 {
        if (counterClockwise) {
            angle = -1 * angle;
        }
        return vectorIn.rotate(angle, 0, true);
    }

    static convertToRadians(angle: number): number {
        return (angle / 360) * 2 * Math.PI;
    }

    static closestToZero(a: number, b: number): number {
        const absA = Math.abs(a);
        const absB = Math.abs(b);
        if (absB < absA) {
            return b;
        }
        return a;
    }

    static getLineBetween(p1: Vec2, p2: Vec2): SimpleLine {
        return new SimpleLine(p1, p2);
    }
}
