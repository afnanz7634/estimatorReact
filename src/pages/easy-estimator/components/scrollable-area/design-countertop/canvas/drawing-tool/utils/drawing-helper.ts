import { CORNER_RADIUS_SIGN } from '@common/constants';
import { range } from 'lodash';

// TODO harcoded for now untill backend fixes it
export const getCornerRadiusLabel = (cornerName: string): string => {
    let lbl = '';
    switch (cornerName) {
        case 'Radius above 42 in.':
            lbl = '42';
            break;
        case 'Radius up to 42 in.':
            lbl = '42';
            break;
        case 'Radius up to 30 in.':
            lbl = '30';
            break;
        case 'Radius up to 18 in.':
            lbl = '18';
            break;
        case 'Radius up to 6 in.':
            lbl = '6';
            break;
        case 'Radius ¾ inches':
            lbl = '0.75';
            break;
        default:
            lbl = '0.75';
            break;
    }
    return ` ${CORNER_RADIUS_SIGN} ${lbl} ″`;
};

export const getCornerRadiusRanges = (cornerName: string | undefined): Array<number> => {
    let rangeArray: Array<number> = [];

    switch (cornerName) {
        case 'Radius above 42 in.':
            rangeArray = range(43, 500, 1);
            break;
        case 'Radius up to 42 in.':
            rangeArray = range(31, 43, 1);
            break;
        case 'Radius up to 30 in.':
            rangeArray = range(19, 31, 1);
            break;
        case 'Radius up to 18 in.':
            rangeArray = range(7, 19, 1);
            break;
        case 'Radius up to 6 in.':
            rangeArray = range(1, 7, 1);
            break;
        case 'Radius ¾ inches':
            rangeArray = [0.75];
            break;
        default:
            rangeArray = [];
            break;
    }
    return rangeArray;
};
