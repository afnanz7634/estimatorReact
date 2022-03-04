import { ThicknessOption } from './color-thickness.model';

export interface ColorModel {
    productId: number;
    name: string;
    swatchImageUrl: string;
    slabImageUrl: string;
    beautyShotImageUrl: string;
    brand: string;
    colorCategory: string;
    price: number;
    priceWithoutDiscount: number;
    thicknessOptions: Array<ThicknessOption>;
    rank?: number;
    overlayColor: string;
}
