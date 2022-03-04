import { ProductQty } from './product-qty.model';

export interface ProductEstimateQuery {
    storeId: number | null;
    zipCode: string;
    products: ProductQty[];
}
