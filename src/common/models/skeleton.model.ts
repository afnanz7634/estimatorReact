// import {Point} from "paper/dist/paper-core";
// type Point = InstanceType<typeof Point>;

import Vec2 from 'vec2';

export interface SkeletonSeg {
    pos: Vec2;
    depth: number; // Represents the depth of the segment which has this pos as a starting point
}

export type Skeleton = Array<SkeletonSeg>;
