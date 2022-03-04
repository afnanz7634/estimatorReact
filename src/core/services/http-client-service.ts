import { CancelToken } from 'axios';
import http from './http-common';

const get = (url: string, cancelToken?: CancelToken) => {
    return http.get(url, { cancelToken });
};

const getById = (url: string, id: any) => {
    return http.get(`${url}/${id}`);
};

const post = (url: string, data: any) => {
    return http.post(url, data);
};

const update = (url: string, id: string, data: any) => {
    return http.put(`${url}/${id}`, data);
};

const remove = (url: string, id: string) => {
    return http.delete(`${url}/${id}`);
};

const removeAll = (url: string) => {
    return http.delete(url);
};

export default {
    get,
    getById,
    post,
    update,
    remove,
    removeAll,
};
