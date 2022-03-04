import { EdgeModel } from '@common/models';
import { createContext, useReducer, useState } from 'react';
import { edgeReducer, initialSelectedEdge, SELECT_EDGE_BY_DEFAULT, SELECT_EDGE_BY_USER } from './reducers/edgeReducer';

export const EdgeContext = createContext<any>({});

export const EdgeContextProvider = (props: any) => {
    const [edges, setEdges] = useState<EdgeModel[]>([]);
    const [selectedEdgeState, dispatch] = useReducer(edgeReducer, initialSelectedEdge);

    const updateEdges = (value: EdgeModel[]) => {
        setEdges(value);
    };

    const updateSelectedEdgeByDefault = (value: EdgeModel) => {
        dispatch({ type: SELECT_EDGE_BY_DEFAULT, payload: { edge: value } });
    };
    const updateSelectedEdgeByUser = (value: EdgeModel) => {
        dispatch({ type: SELECT_EDGE_BY_USER, payload: { edge: value } });
    };

    return (
        <EdgeContext.Provider
            value={{
                edges,
                updateEdges,
                selectedEdgeState,
                updateSelectedEdgeByDefault,
                updateSelectedEdgeByUser,
            }}
        >
            {props.children}
        </EdgeContext.Provider>
    );
};
