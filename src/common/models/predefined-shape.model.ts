import { PredefinedShapeType } from '@common/enums';
import { Skeleton } from './skeleton.model';

export interface PredefinedShape {
    id: number;
    image: any;
    title: string;
    type: PredefinedShapeType;
    label: string;
    islandLabel: string;
    skeletonData: Skeleton[];
    sourcePath: string;
}
