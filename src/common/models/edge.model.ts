export interface EdgeModel {
    productId: number;
    name: string;
    imageUrl: string;
    price: number;
    priceWithoutDiscount: number;
    // typo from the backend...
    thinkness: string;
}
