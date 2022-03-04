import { StoreModel } from '@common/models';
import { Reducer } from 'react';

export const SELECT_STORE_BY_USER = '[STORE] Select store by user';
export const SELECT_STORE_BY_DEFAULT = '[STORE] Select store by default ';

export type SelectedStoreAction =
    | { type: typeof SELECT_STORE_BY_USER; payload: { store: StoreModel } }
    | { type: typeof SELECT_STORE_BY_DEFAULT; payload: { store: StoreModel } };

export type SelectedStore = {
    store: StoreModel | undefined;
    isSelectedDefault: boolean;
    isSelectedByUser: boolean;
};

export const initialSelectedStore: SelectedStore = {
    store: undefined,
    isSelectedDefault: true,
    isSelectedByUser: false,
};

export const storeReducer: Reducer<SelectedStore, SelectedStoreAction> = (
    state: SelectedStore,
    action: SelectedStoreAction,
) => {
    switch (action.type) {
        case SELECT_STORE_BY_DEFAULT:
            return {
                store: action.payload.store,
                isSelectedDefault: true,
                isSelectedByUser: false,
            };
        case SELECT_STORE_BY_USER:
            return {
                store: action.payload.store,
                isSelectedDefault: false,
                isSelectedByUser: true,
            };
        default:
            return initialSelectedStore;
    }
};
