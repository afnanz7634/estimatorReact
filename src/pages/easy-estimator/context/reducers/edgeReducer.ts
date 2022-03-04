import { EdgeModel } from '@common/models';
import { Reducer } from 'react';

export const SELECT_EDGE_BY_USER = '[EDGE] Select edge by user';
export const SELECT_EDGE_BY_DEFAULT = '[EDGE] Select edge by default ';

export type SelectedEdgeAction =
    | { type: typeof SELECT_EDGE_BY_USER; payload: { edge: EdgeModel } }
    | { type: typeof SELECT_EDGE_BY_DEFAULT; payload: { edge: EdgeModel } };

export type SelectedEdge = {
    edge: EdgeModel | undefined;
    isSelectedDefault: boolean;
    isSelectedByUser: boolean;
};

export const initialSelectedEdge: SelectedEdge = {
    edge: undefined,
    isSelectedDefault: true,
    isSelectedByUser: false,
};

export const edgeReducer: Reducer<SelectedEdge, SelectedEdgeAction> = (
    state: SelectedEdge,
    action: SelectedEdgeAction,
) => {
    switch (action.type) {
        case SELECT_EDGE_BY_DEFAULT:
            return {
                edge: action.payload.edge,
                isSelectedDefault: true,
                isSelectedByUser: false,
            };
        case SELECT_EDGE_BY_USER:
            return {
                edge: action.payload.edge,
                isSelectedDefault: false,
                isSelectedByUser: true,
            };
        default:
            return initialSelectedEdge;
    }
};
