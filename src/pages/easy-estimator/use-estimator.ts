import { LOCAL_STORAGE_KEY } from '@common/constants';
import { RetailerConfigurationModel } from '@common/models';
import httpClientService from '@core/services/http-client-service';
import localStorageInfo from '@core/services/local-storage-info';
import { ShapeContext } from '@ee-context';
import axios from 'axios';
import { useContext, useState } from 'react';

const useEstimator = () => {
    const { updateShapes } = useContext(ShapeContext);
    const [loading, setLoading] = useState(false);

    const fetchRetailerSettings = () => {
        setLoading(true);

        (async () => {
            try {
                const response = await httpClientService.get(`/retailer/settings`);
                const retailerConfig: RetailerConfigurationModel = response.data;
                localStorageInfo.setStorageData(LOCAL_STORAGE_KEY.RETAILER_SETTING, retailerConfig);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        })();
    };

    const fetchPredefinedShapes = () => {
        (async () => {
            try {
                const response = await axios.get(`./public/assets/predefined-shapes.json`);
                updateShapes(response.data);
            } catch (error) {
                console.log(error);
            }
        })();
    };

    return {
        fetchPredefinedShapes,
        fetchRetailerSettings,
        loading,
    };
};

export default useEstimator;
