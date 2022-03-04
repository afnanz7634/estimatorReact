export interface PricedProduct {
    listKey: string;
    productId: number;
    name: string;
    productType: string;
    price: number;
    priceWithoutDiscount: number;
    quantity: number;
    promotionStartDate?: Date;
    promotionEndDate?: Date;
    lineItemId?: number;
}
