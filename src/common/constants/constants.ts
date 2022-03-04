//UNIT1 for 1 dimensions like 'ft', 'm' might be added later
import { TearOutCountertopModel } from '@common/models';

export const LOCAL_STORAGE_KEY = {
    RETAILER_SETTING: 'retailer_setting',
};

export const FREE_LIST_CORNER_ITEM = 'Free_Corner_item';
export const LIST_ITEM = 'List_item';
export const UNIT_MEASURE = {
    MATERIALS: 'sq ft',
    EDGE: 'lin. in.',
    SIDE_WALLS: 'in.',
    CORNER_RADIUS: 'ea.',
    DIAGONAL_CORNER: 'ea.',
    TEAR_OUT: 'sq. ft.',
};

export const BACKSPLASH = 'Backsplash';
export const BACKSPLASH_DEFAULT_VALUE = '4';

export const DRAWING_TABS = {
    PREDEFINED_SHAPE: 'PREDEFINED SHAPE',
    DRAW_LAYOUT: 'DRAW LAYOUT',
};

export const DRAWING_STATE = {
    PREDEFINED_SHAPES: 'predefined-shapes',
    FREE_DRAWING: 'free-drawing',
    FIRST_SHAPE: '1',
};

export const TOOLBAR_ITEM_NAME = {
    REDO: 're_do',
    UNDO: 'un_do',
    ROTATE_CLOCKWISE: 'rotate_clockwise',
    ROTATE_COUNTERCLOKEWISE: 'rotate_counterclockwise',
    REMOVE: 'remove',
};

export const DISCONTINUED = 'discontinued';
export const SEPARATOR_CHARACTER = ',';
export const CORNER_RADIUS_SIGN = 'R';
export const CIRCLE_CORNER_RADIUS = 3;
export const OPACITY_CIRCLE_CORNER = 0.6;
export const DEFAULT_DEPTH = 25.5;
export const FREE_DRAWING_SHAPE_MINIMUM_LENGTH = 25.5;
export const EDGE_LENGTH_INPUT_LIMIT = {
    MIN: 1,
    MAX: 300,
};

export const DEFAULT_EDGE_NAME = 'Eased Edge';

export const CANVAS_OBJECT_TYPE_PREFIX = {
    SHAPE_MAIN: 'shape_main',
    SHAPE_EDGE: 'shape_edge',
    SHAPE_LABEL: 'shape_label',
    SHAPE_MEASURE_LABEL: 'shape_measure_label',
    EDGE_NAME: 'edge_name',
    ACTIVE_SHAPE_HIGHLIGHTS: 'active_shape_highlights',
    CORNER_RADIUS_MEASUREMENT: 'corner_radius_measurement',
    CORNER_RADIUS_CIRCLE: 'corner_radius_circle',
    FREE_DRAWING_TEMP_SHAPE: 'free_drawing_temporary_shape',
    FREE_DRAWING_TEMP_LENGTH: 'free_drawing_temporary_length',
    POLYGON_BACKSPLASH: 'polygon_backsplash',
    BACKSPLASH_GROUP: 'backsplash_group',
    BACKSPLASH_ARROW: 'backsplash_arrow',
    BACKSPLASH_LABEL: 'backsplash_label',
    BACKSPLASH_MEASURE_LABEL: 'backsplash_label_measure',
};

export const DRAWING_SHAPE_COLOR_PALETTE = {
    ACTIVE: {
        STROKE: 'black',
    },
    NORMAL: {
        STROKE: 'grey',
    },
};

export const QUARTERPART_NAME = {
    POS_X_AXIS: 'pos_x_axis',
    NEG_X_AXIS: 'neg_x_axis',
    POS_Y_AXIS: 'pos_y_axis',
    NEG_Y_AXIS: 'neg_y_axis',
    QAURTER_1: 'quarter_1', //x>0, y<0
    QAURTER_2: 'quarter_2', //x>0, y>0
    QAURTER_3: 'quarter_3', //x<0, y>0
    QAURTER_4: 'quarter_4', //x<0, y<0
};

export const REMOVE_DIAGONAL_CORNER = 'Remove Diagonal Corner';

// color filters
export const COLOR_CATEGORY = 'colorCategory';
export const COLOR_BRAND = 'brand';

export const FREE_TEAR_OUT = 'I will complete tear-out';
