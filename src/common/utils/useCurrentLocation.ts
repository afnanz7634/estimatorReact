import { useEffect, useState } from 'react';

const useCurrentLocation = (options = {}) => {
    const [location, setLocation] = useState<GeolocationCoordinates>();
    const [error, setError] = useState('');

    const handleSuccess = (position: any) => {
        setLocation(position.coords);
    };

    const handleError = (error: any) => {
        setError(error.message);
    };

    useEffect(() => {
        const { geolocation } = navigator;

        // If the geolocation is not defined in the used browser you can handle it as an error
        if (!geolocation) {
            setError('Geolocation is not supported.');
            return;
        }

        geolocation.getCurrentPosition(handleSuccess, handleError, options);
    }, []);

    return { location, error };
};

export default useCurrentLocation;
