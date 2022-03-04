const getAuthToken = (): string => {
    let token = localStorage.getItem('token');

    /** Use test token, must be removed later */
    if (!token) {
        token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIyNjUyIiwibmJmIjoxNjM2OTgyMDE4LCJleHAiOjE2Njg1MTgwMTgsImlhdCI6MTYzNjk4MjAxOH0.WfySQz5eS8QxFMRjhmpRzriVqn2e1ZkXmfX1wg6orHY';
        localStorage.setItem('token', token);
    }
    return token;
};

const setStorageData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const getStorageData = (key: string) => {
    const data = localStorage.getItem(key);
    return data && JSON.parse(data);
};

export default {
    getAuthToken,
    setStorageData,
    getStorageData,
};
