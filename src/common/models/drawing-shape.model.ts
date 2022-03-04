import { SideItemType } from '@common/enums';
import { ShapeType } from '@common/enums/shape-types.enum';
import { Subject } from 'rxjs';
import Vec2 from 'vec2';
import { Skeleton } from '.';

export interface DrawingShape {
    skeleton: Skeleton;
    highlightPoints?: Vec2[];
    type: ShapeType;
    id: string;
    label?: string;
    arrowsInfo?: Array<ArrowInfo>;
    areaInfo?: AreaInfo;
    onTextChange?: Subject<string>;
    canvasObjectName?: string;
    cornerMap: {
        [key: string]: CornerInfo;
    };
    drawingEdges: Array<DrawingEdge>;
    removedElementsHistory?: RemovedElementsHistory;
    establishedLetterStartIndex?: number;
}

export interface DrawingEdge {
    id: string;
    startCornerId: string;
    endCornerId: string;
    normalVec: Vec2;
    dirVec: Vec2;
    isVisibleInCanvas: boolean;
    drawingShapeId: string;
    backsplash: Backsplash;
}
export interface CornerInfo {
    id: string;
    label?: string;
    coords: Vec2;
    text?: fabric.Text; // canvas text object reference
    productId?: number;
    skIndex: number;
    angle?: number;
    isUpper: boolean; // top or bottom point against skeletonSeg
    radius?: number;
    isVisibleInCanvas?: boolean;
}
export interface ArrowInfo {
    label?: string;
    length?: number;
    path: Vec2[]; //which is equivalent to one item of the arrows in DrawingShape itself
    isInterior?: boolean;
    drawingEdgeId?: string;
    isVisibleInCanvas?: boolean;
    iActiveForEdgeCalc?: boolean;
}

export interface LineSegment {
    startPoint: Vec2;
    endPoint: Vec2;
}

export interface AreaInfo {
    main: number;
    diagCorner: number;
    total: number;
    [key: string]: number;
    //other types of area elements will come here
}

export interface RemovedElementsHistory {
    edgesAndCorners: Array<RemovedEdgeAndCorners>;
}

export interface RemovedEdgeAndCorners {
    sideItemType: SideItemType;
    drawingEdge: DrawingEdge;
    arrowInfo: ArrowInfo | null;
    appliedCorners: Array<CornerInfo>;
}

export interface Backsplash {
    depth: number;
    arrowsInfo?: Array<ArrowInfo>;
}
