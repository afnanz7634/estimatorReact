import { CustomSideContext, DrawingShapeContext, MaterialContext, StoreContext, ZipCodeContext } from '@ee-context';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';

const useCustomSides = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const { customSides, updateCustomSides, selectedCustomSide, updateSelectedCustomSide } =
        useContext(CustomSideContext);
    const { zipcode } = useContext(ZipCodeContext);
    const { selectedStoreState } = useContext(StoreContext);
    const { selectedMaterialState } = useContext(MaterialContext);
    const { drawingShapes } = useContext(DrawingShapeContext);

    const selectedStore = selectedStoreState.store;
    /**
     * Used to fetch the predefined custom sides.
     */
    const fetchPredefinedCustomSides = () => {
        (async () => {
            try {
                setLoading(true);
                const response = await axios.get(`./public/assets/predefined-custom-sides.json`);
                updateCustomSides(response.data);
            } catch (error) {
                setError(true);
            } finally {
                setLoading(false);
            }
        })();
    };

    useEffect(() => {
        fetchPredefinedCustomSides();
    }, []);

    const isCustomSideAvailable = () => {
        return zipcode && selectedStore && selectedMaterialState.material && drawingShapes.length > 0;
    };

    return {
        loading,
        error,
        customSides,
        selectedCustomSide,
        updateSelectedCustomSide,
        isCustomSideAvailable,
    };
};

export default useCustomSides;
