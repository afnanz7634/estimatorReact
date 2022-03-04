import { BACKSPLASH, FREE_LIST_CORNER_ITEM, FREE_TEAR_OUT, LIST_ITEM } from '@common/constants';
import { ProductType } from '@common/enums';
import { PricedProduct, ProductEstimateQuery, ProductQty, TearOutCountertopModel } from '@common/models';
import { ArrowInfo, CornerInfo, DrawingShape } from '@common/models/drawing-shape.model';
import httpClientService from '@core/services/http-client-service';
import {
    ColorContext,
    DrawingShapeContext,
    EdgeContext,
    MaterialContext,
    PriceContext,
    StoreContext,
    TearOutCountertopContext,
    ZipCodeContext,
} from '@ee-context';
import { uniqueId } from 'lodash';
import { useContext, useEffect, useState } from 'react';

export const createProductEstimateQuery = (
    storeId: number,
    zipCode: string,
    products: ProductQty[],
): ProductEstimateQuery => {
    return {
        storeId: storeId,
        zipCode: zipCode,
        products: products,
    };
};
const usePricedProducts = () => {
    const { selectedStoreState } = useContext(StoreContext);
    const { zipcode } = useContext(ZipCodeContext);
    const { selectedColorState } = useContext(ColorContext);
    const { selectedMaterialState } = useContext(MaterialContext);
    const { drawingShapes } = useContext(DrawingShapeContext);
    const {
        countertopAreaQty,
        pricedProducts,
        updatePricedProducts,
        totalPrice,
        updateTotalPrice,
        pricedCornerRad,
        pricedEdges,
        backSplashAreaQty,
    } = useContext(PriceContext);
    const { selectedEdgeState } = useContext(EdgeContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const selectedColor = selectedColorState.color;
    const selectedStore = selectedStoreState.store;
    const selectedEdge = selectedEdgeState.edge;

    const { selectedTearOut } = useContext(TearOutCountertopContext);

    // popover manipulation
    const [showPopOver, setShowPopOver] = useState(false);

    const handleVisibleChange = () => {
        setShowPopOver(!showPopOver);
    };

    const closePopOver = () => {
        setShowPopOver(false);
    };

    const getDefaultEdgesQty = () => {
        let edgesQuantity = 0;
        drawingShapes?.map((drawingShape: DrawingShape) => {
            if (drawingShape?.arrowsInfo) {
                drawingShape.arrowsInfo
                    .filter((arrow: ArrowInfo) => arrow.length && !arrow.isInterior && arrow.iActiveForEdgeCalc)
                    .forEach((arrow: ArrowInfo) => {
                        edgesQuantity += arrow.length || 0;
                    });
            }
        });

        return edgesQuantity;
    };

    const getCornerRadiusQty = (cornerRadiiInfo: CornerInfo[]) => {
        let cornerRadiiQuantity = 0;

        cornerRadiiInfo
            .filter((cornerRadius) => cornerRadius && !cornerRadius.productId && cornerRadius.isVisibleInCanvas)
            .forEach(() => {
                cornerRadiiQuantity++;
            });
        return cornerRadiiQuantity;
    };

    // aggregate data from request and client side
    const getAggregatedPricedProducts = (pricedProducts: PricedProduct[]) => {
        const aggregatedPricedProducts = [...pricedProducts];
        let freeCornerRadiusQty: CornerInfo | undefined;

        drawingShapes.forEach((drawingShape: DrawingShape) => {
            const cornerRadiiInfo = Object.values(drawingShape.cornerMap);
            freeCornerRadiusQty = cornerRadiiInfo.find((cornerRadius: CornerInfo) => !cornerRadius.productId);

            // insert free corner radius on third position of priced products array
            if (freeCornerRadiusQty) {
                const freeCornerRadius: PricedProduct = {
                    listKey: `${FREE_LIST_CORNER_ITEM}_${uniqueId()}`,
                    productId: freeCornerRadiusQty?.productId!,
                    name: freeCornerRadiusQty?.label || '',
                    productType: ProductType.CORNER_RADIUS,
                    price: 0,
                    priceWithoutDiscount: 0,
                    quantity: getCornerRadiusQty(cornerRadiiInfo),
                };
                aggregatedPricedProducts.splice(2, 0, freeCornerRadius);
            }
        });

        // accumulate duplicate corner radii
        const reducedAggredgatedPricedProducts = aggregatedPricedProducts.reduce(
            (accumulator: PricedProduct[], currentPricedProduct: PricedProduct) => {
                const accumulatedPricedProducts = [...accumulator];
                const duplicatePricedProduct = accumulatedPricedProducts.findIndex(
                    (pricedProduct) =>
                        pricedProduct.productId === currentPricedProduct.productId && !currentPricedProduct.lineItemId,
                );

                if (duplicatePricedProduct !== -1) {
                    accumulatedPricedProducts[duplicatePricedProduct] = {
                        ...accumulatedPricedProducts[duplicatePricedProduct],
                        quantity:
                            accumulatedPricedProducts[duplicatePricedProduct].quantity + currentPricedProduct.quantity,
                    };
                } else {
                    accumulatedPricedProducts.push(currentPricedProduct);
                }

                return accumulatedPricedProducts;
            },
            [],
        );

        // send the list ordered by productId
        const orderedPricedProducts = reducedAggredgatedPricedProducts
            .filter((product) => product.quantity > 0)
            .sort(function (prevPricedProduct, currentPricedProduct) {
                if (
                    prevPricedProduct.productType === ProductType.CORNER_RADIUS &&
                    currentPricedProduct.productType === ProductType.CORNER_RADIUS
                ) {
                    return prevPricedProduct.productId > currentPricedProduct.productId ? 1 : -1;
                }

                return 0;
            });

        return orderedPricedProducts;
    };

    const addProductEstimateQuery = async () => {
        if (selectedMaterialState.material && selectedColor && selectedColor.productId !== undefined) {
            const edgeQuantity = getDefaultEdgesQty();

            const pricedTearOuts = Array.from((selectedTearOut as Map<TearOutCountertopModel, number>).entries()).map(
                (tearOut) => {
                    if (tearOut[0].name !== FREE_TEAR_OUT)
                        return {
                            productId: tearOut[0].productId,
                            quantity: tearOut[1],
                        };
                },
            );

            const products = [
                {
                    productId: selectedColor.productId,
                    quantity: countertopAreaQty,
                },
                {
                    productId: selectedEdge.productId,
                    quantity: edgeQuantity,
                },
            ];

            pricedTearOuts.forEach((pricedTearOut) => {
                if (pricedTearOut !== undefined) {
                    products.push(pricedTearOut);
                }
            });

            const productEstimateQuery = createProductEstimateQuery(selectedStore.companyId, zipcode, products);

            drawingShapes.forEach((drawingShape: DrawingShape) => {
                const cornerRadiiInfo = Object.values(drawingShape.cornerMap);
                cornerRadiiInfo.forEach((cornerRadius: CornerInfo) => {
                    if (cornerRadius.productId && cornerRadius.isVisibleInCanvas) {
                        productEstimateQuery.products.push({
                            productId: cornerRadius.productId,
                            quantity: 1,
                        });
                    }
                });
            });

            if (backSplashAreaQty)
                productEstimateQuery.products.push({
                    productId: selectedColor.productId,
                    quantity: backSplashAreaQty,
                    lineItemId: Number(uniqueId()),
                });

            // accumulate duplicate corner radii
            const reducedProductsQty = productEstimateQuery.products.reduce(
                (accumulator: ProductQty[], currentProductQty: ProductQty) => {
                    const accumulatedProductsQty = [...accumulator];
                    const duplicateProductsQty = accumulatedProductsQty.findIndex(
                        (productQty) =>
                            productQty.productId === currentProductQty.productId && !currentProductQty.lineItemId,
                    );

                    if (duplicateProductsQty !== -1) {
                        accumulatedProductsQty[duplicateProductsQty] = {
                            ...accumulatedProductsQty[duplicateProductsQty],
                            quantity:
                                accumulatedProductsQty[duplicateProductsQty].quantity + currentProductQty.quantity,
                        };
                    } else {
                        accumulatedProductsQty.push(currentProductQty);
                    }

                    return accumulatedProductsQty;
                },
                [],
            );

            productEstimateQuery.products = reducedProductsQty.filter((product) => product.quantity > 0);
            const url = '/products/estimate';
            const response = await httpClientService.post(url, productEstimateQuery);
            return response.data;
        }
    };

    const getPricedProducts = async () => {
        try {
            if (countertopAreaQty) {
                setLoading(true);
                setError(false);

                const pricedProducts: PricedProduct[] = await addProductEstimateQuery();
                const aggregatedPricedProducts = getAggregatedPricedProducts(pricedProducts);
                updatePricedProducts(aggregatedPricedProducts);

                let totalSum = 0;
                pricedProducts.forEach((pricedProduct) => {
                    totalSum += pricedProduct.priceWithoutDiscount;
                    pricedProduct.listKey = `${LIST_ITEM}_${uniqueId()}`;
                    if (pricedProduct.lineItemId) pricedProduct.name = BACKSPLASH;
                });

                updateTotalPrice(totalSum);
            }
        } catch (error) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);

        // this is a debounce of calculating price, it's not ideal but it solves the problem
        // until the 'real' solution to the problem is implemented
        const handler = setTimeout(() => {
            getPricedProducts();
        }, 1500);

        return () => {
            clearTimeout(handler);
        };
    }, [countertopAreaQty, selectedColor, selectedEdge, drawingShapes, backSplashAreaQty, selectedTearOut]);

    return {
        selectedMaterialState,
        selectedColor,
        drawingShapes,
        countertopAreaQty,
        totalPrice,
        pricedProducts,
        pricedCornerRad,
        pricedEdges,
        loading,
        error,
        showPopOver,
        handleVisibleChange,
        closePopOver,
    };
};

export default usePricedProducts;
