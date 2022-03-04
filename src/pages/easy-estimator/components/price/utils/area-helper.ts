import { AreaInfo, Backsplash, DrawingShape } from '@common/models/drawing-shape.model';
import Vec2 from 'vec2';
import { get025Rounds } from '../../scrollable-area/design-countertop/canvas/drawing-tool/utils/math-helper';

export const getShapeArea = (dShape: DrawingShape): number => {
    let area = 0.0;

    const sk = dShape.skeleton;

    let isLastRect = false; // Is used for check previous 2 segments are perpendicular

    for (let i = 1; i < sk.length; i++) {
        const prevUpperOutlinePt = Object.values(dShape.cornerMap).find(
            (item) => item.skIndex === i - 1 && item.isUpper,
        );
        const nextUpperOutlinePt = Object.values(dShape.cornerMap).find((item) => item.skIndex === i && item.isUpper);

        const prevBottomOutlinePt = Object.values(dShape.cornerMap).find(
            (item) => item.skIndex === i - 1 && !item.isUpper,
        );
        const nextBottomOutlinePt = Object.values(dShape.cornerMap).find((item) => item.skIndex === i && !item.isUpper);

        if (!(prevUpperOutlinePt && nextUpperOutlinePt && prevBottomOutlinePt && nextBottomOutlinePt)) {
            continue;
        }

        //Use get025Rounds func for the consistency with measurement text
        const upperDist = get025Rounds(nextUpperOutlinePt.coords.subtract(prevUpperOutlinePt.coords, true).length());
        const bottomDist = get025Rounds(nextBottomOutlinePt.coords.subtract(prevBottomOutlinePt.coords, true).length());

        const bigDist = upperDist > bottomDist ? upperDist : bottomDist;
        const smallDist = upperDist < bottomDist ? upperDist : bottomDist;

        if (isLastRect) {
            area += smallDist * sk[i - 1].depth * 2;
        } else {
            area += bigDist * sk[i - 1].depth * 2;
        }

        if (i === sk.length - 1) {
            break;
        }

        const prevVec = new Vec2(sk[i].pos.x - sk[i - 1].pos.x, sk[i].pos.y - sk[i - 1].pos.y).normalize();
        const nextVec = new Vec2(sk[i + 1].pos.x - sk[i].pos.x, sk[i + 1].pos.y - sk[i].pos.y).normalize();

        if (prevVec.x * nextVec.x + prevVec.y * nextVec.y < Number.EPSILON) {
            if (isLastRect) {
                area += sk[i - 1].depth * sk[i].depth * 4;
            }
            isLastRect = true;
        } else {
            isLastRect = false;
        }
    }
    area = Math.ceil(area / (12 * 12));
    if (dShape.areaInfo) {
        dShape.areaInfo.main = area;
    } else {
        dShape.areaInfo = {
            main: area,
            diagCorner: 0,
            total: area,
        };
    }
    updateAreaInfo(dShape.areaInfo);
    return area;
};

export const updateAreaInfo = (areaInfo: AreaInfo): void => {
    const total = Object.keys(areaInfo).reduce((prev, cur) => {
        return cur == 'total' ? prev : prev + areaInfo[cur];
    }, 0);

    areaInfo.total = total;
};

export const getBacksplashArea = (backsplash: Backsplash) => {
    let area = 0.0;
    if (!backsplash?.arrowsInfo?.length) return area;

    if (backsplash.arrowsInfo?.[0]?.length && backsplash.arrowsInfo?.[1]?.length) {
        area = backsplash.arrowsInfo?.[0].length * backsplash.arrowsInfo?.[1].length;
        area = Math.ceil(area / (12 * 12));
    }
    return area;
};
