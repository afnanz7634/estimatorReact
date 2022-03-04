import { StoreModel } from '@common/models';
import { createContext, useReducer, useState } from 'react';
import {
    initialSelectedStore,
    SELECT_STORE_BY_DEFAULT,
    SELECT_STORE_BY_USER,
    storeReducer,
} from './reducers/storeReducer';

export const StoreContext = createContext<any>({});

export const StoreContextProvider = (props: any) => {
    const [stores, setStores] = useState<StoreModel[]>();
    const [selectedStoreState, dispatch] = useReducer(storeReducer, initialSelectedStore);

    const [loadedStore, setLoadedStore] = useState(false);

    const updateStores = (value: StoreModel[]) => {
        setStores(value);
    };
    const updateLoadedStore = (value: boolean) => {
        setLoadedStore(value);
    };

    const updateSelectedStoreByDefault = (value: StoreModel) => {
        dispatch({ type: SELECT_STORE_BY_DEFAULT, payload: { store: value } });
    };
    const updateSelectedStoreByUser = (value: StoreModel) => {
        dispatch({ type: SELECT_STORE_BY_USER, payload: { store: value } });
    };

    return (
        <StoreContext.Provider
            value={{
                stores,
                updateStores,
                selectedStoreState,
                updateSelectedStoreByDefault,
                updateSelectedStoreByUser,
                loadedStore,
                updateLoadedStore,
            }}
        >
            {props.children}
        </StoreContext.Provider>
    );
};
