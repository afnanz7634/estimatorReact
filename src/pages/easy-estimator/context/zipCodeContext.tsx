import { createContext, useState } from 'react';

export const ZipCodeContext = createContext<any>({});

export const ZipCodeContextProvider = (props: any) => {
    const [zipcode, setZipcode] = useState<string>();
    const [isZipcodeSet, setIsZipcodeSet] = useState<boolean>(false);

    // this is used mainly for display when allowing location from browser
    const [zipcodeFromLocation, setZipcodeFromLocation] = useState<string>();

    const updateZipcode = (value: string) => {
        setZipcode(value);
    };

    const updateisZipcodeSet = (value: boolean) => {
        setIsZipcodeSet(value);
    };

    const updateZipcodeFromLocation = (value: string) => {
        setZipcodeFromLocation(value);
    };

    return (
        <ZipCodeContext.Provider
            value={{
                zipcode,
                updateZipcode,
                zipcodeFromLocation,
                updateZipcodeFromLocation,
                isZipcodeSet,
                updateisZipcodeSet,
            }}
        >
            {props.children}
        </ZipCodeContext.Provider>
    );
};
