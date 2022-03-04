import { PricedProduct } from '@common/models';
import { createContext, useState } from 'react';

export const PriceContext = createContext<any>({});

export const PriceContextProvider = (props: any) => {
    const [counterTopAreaQty, setCounterTopAreaQty] = useState<number | undefined>();
    const [pricedProducts, setPricedProducts] = useState<PricedProduct | undefined>();
    const [backSplashAreaQty, setBackSplashAreaQty] = useState<number | undefined>();

    const [totalPrice, setTotalPrice] = useState(0);

    const updateCounterTopArea = (value: number) => {
        setCounterTopAreaQty(value);
    };

    const updateBacksplashArea = (value: number) => {
        setBackSplashAreaQty(value);
    };

    const updateTotalPrice = (value: number) => {
        setTotalPrice(value);
    };

    const updatePricedProducts = (value: PricedProduct) => {
        setPricedProducts(value);
    };

    return (
        <PriceContext.Provider
            value={{
                countertopAreaQty: counterTopAreaQty,
                updateCounterTopArea,
                totalPrice,
                updateTotalPrice,
                pricedProducts,
                updatePricedProducts,
                backSplashAreaQty,
                updateBacksplashArea,
            }}
        >
            {props.children}
        </PriceContext.Provider>
    );
};
