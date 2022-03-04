import { CaretDownOutlined, CloseOutlined } from '@ant-design/icons';
import { LOCAL_STORAGE_KEY, UNIT_MEASURE } from '@common/constants';
import { ProductType } from '@common/enums';
import { PricedProduct } from '@common/models';
import { setDefaultSrc } from '@common/utils';
import { Error } from '@core/components';
import localStorageInfo from '@core/services/local-storage-info';
import { Button, Col, Image, Popover, Row, Spin } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PriceAreaDefaultInfo } from './components/price-area-default-info';
import './price.scss';
import usePricedProducts from './usePricedProducts';

export interface PriceProps {}
export interface PriceDetailedItemProps {
    priceItem: PricedProduct;
}

export function Price(props: PriceProps) {
    const { t } = useTranslation();
    const {
        selectedMaterialState,
        selectedColor,
        countertopAreaQty,
        totalPrice,
        pricedProducts,
        loading,
        error,
        showPopOver,
        handleVisibleChange,
        closePopOver,
    } = usePricedProducts();
    const selectedMaterial = selectedMaterialState.material;

    const [expanded, setExpanded] = useState(false);
    const retailerSetting = localStorageInfo.getStorageData(LOCAL_STORAGE_KEY.RETAILER_SETTING);

    const getUnitType = (priceItem: PricedProduct): string => {
        let unitType = '';
        switch (priceItem.productType) {
            case ProductType.EDGE:
                unitType = UNIT_MEASURE.EDGE;
                break;
            case ProductType.CORNER_RADIUS:
                unitType = UNIT_MEASURE.CORNER_RADIUS;
                break;

            default:
                unitType = UNIT_MEASURE.MATERIALS;
                break;
        }
        return unitType;
    };

    const SelectedMaterial = () => {
        return <div className="selected-material">{selectedMaterial.description}</div>;
    };

    const SelectedColor = () => {
        return (
            <div>
                {selectedColor && (
                    <div className="image-container">
                        <Image
                            className="image"
                            preview={false}
                            width={240}
                            height={156}
                            src={
                                selectedColor.beautyShotImageUrl
                                    ? selectedColor.beautyShotImageUrl
                                    : selectedColor.swatchImageUrl
                            }
                            onError={setDefaultSrc}
                        />

                        {selectedMaterial && countertopAreaQty && <SelectedMaterial />}
                    </div>
                )}
            </div>
        );
    };

    const TotalPrice = () => {
        const roundedPrice = totalPrice.toFixed(2);
        return (
            <div className="total-price-container">
                <div>{t('PRICING_AREA.TOTAL')}</div>
                <div className="total-price">${roundedPrice}</div>
            </div>
        );
    };

    const BIContent = () => {
        return (
            <div className="content-container">
                <div className="description"> {t('PRICING_AREA.BASIC_INSTALLATION_CONTENT')}</div>
                <CloseOutlined className="close-icon" onClick={closePopOver} />
            </div>
        );
    };

    const BasicInstallation = () => {
        return (
            <Popover
                placement="bottom"
                content={BIContent}
                trigger="click"
                visible={showPopOver}
                onVisibleChange={handleVisibleChange}
            >
                <div className="basic-installation" onClick={handleVisibleChange}>
                    {t('PRICING_AREA.BASIC_INSTALLATION')}
                </div>
            </Popover>
        );
    };

    const CheckoutButton = () => {
        return (
            <div className="checkout-btn-container">
                <Button className="checkout-button" type="primary">
                    {t('BUTTON.CHECKOUT')}
                </Button>
            </div>
        );
    };

    const callback = () => {
        setExpanded(!expanded);
    };

    const Arrow = () => {
        return (
            <div className="collapse-arrow" onClick={callback}>
                {!expanded ? <CaretDownOutlined /> : <CaretDownOutlined rotate={180} />}
            </div>
        );
    };

    const PriceDetails = () => {
        return (
            <>
                <div className="title">
                    {t('PRICING_AREA.PRICE_DETAILS')}
                    {retailerSetting.showPriceDetails.collapsable && <Arrow />}
                </div>
                {(!retailerSetting.showPriceDetails.collapsable ||
                    (retailerSetting.showPriceDetails.collapsable && expanded)) && (
                    <div className="price-details-container">
                        {pricedProducts.map((pricedProduct: PricedProduct) => (
                            <PriceDetailedItem key={pricedProduct?.listKey} priceItem={pricedProduct} />
                        ))}
                    </div>
                )}
            </>
        );
    };

    const PriceAreaInfo = () => {
        return (
            <div className="main-price-container">
                <SelectedColor />

                {!loading && !error && (
                    <>
                        <TotalPrice />
                        <BasicInstallation />

                        <CheckoutButton />

                        {retailerSetting.showPriceDetails.showDetails && <PriceDetails />}
                    </>
                )}

                {loading && <Spin className="loading-spinner" />}
                {error && !loading && (
                    <div className="error-container">
                        <Error errorStyle="error-message" errorMessage={t('ERROR_MESSAGE.STH_WENT_WRONG')} />
                    </div>
                )}
            </div>
        );
    };

    const PriceDetailedItem = (props: PriceDetailedItemProps) => {
        const { priceItem } = props;
        const quantity = priceItem.quantity.toFixed(0);

        const unit_type = getUnitType(priceItem);
        const price = priceItem.priceWithoutDiscount.toLocaleString('en-US', { maximumFractionDigits: 2 });
        return (
            <Row
                className="price-item-container"
                justify="space-around"
                align="middle"
                gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
                wrap={true}
            >
                <Col span={8}>
                    <div className="product-name">{priceItem.name}</div>
                </Col>
                <Col span={8}>
                    <div className="product-qty">
                        {quantity} {unit_type}
                    </div>
                </Col>
                <Col span={8}>
                    <div className="product-price">${price}</div>
                </Col>
            </Row>
        );
    };

    return (
        <div className="price-container">
            {pricedProducts ? <PriceAreaInfo /> : <PriceAreaDefaultInfo selectedColor={selectedColor} />}
        </div>
    );
}

export default Price;
