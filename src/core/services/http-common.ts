import axios from 'axios';
import localStorageInfo from './local-storage-info';

const authToken = localStorageInfo.getAuthToken();

export default axios.create({
    baseURL: 'https://awojx3kj8h.execute-api.us-east-1.amazonaws.com/Dev',
    headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-type': 'application/json',
    },
});
