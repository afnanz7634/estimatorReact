import { LOCAL_STORAGE_KEY, SEPARATOR_CHARACTER } from '@common/constants';
import { StoreModel } from '@common/models';
import { preventNonNumericalInput, validateZipCode } from '@common/utils';
import localStorageInfo from '@core/services/local-storage-info';
import { StoreContext, ThicknessContext, ZipCodeContext } from '@ee-context';
import { Card, Divider, Form, Input } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import Modal from 'antd/lib/modal/Modal';
import { RuleObject } from 'rc-field-form/lib/interface';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './zip-code-stores.scss';

export interface ZipCodeStoresProps {
    onSubmit: (value: string) => void;
    loading: boolean;
}

export interface StoreItemProps {
    store: StoreModel;
}

export function ZipCodeStores(props: ZipCodeStoresProps) {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { onSubmit, loading } = props;

    const { zipcodeFromLocation, zipcode, updateZipcode, isZipcodeSet, updateisZipcodeSet } =
        useContext(ZipCodeContext);
    const { stores, selectedStoreState, updateSelectedStoreByUser } = useContext(StoreContext);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const retailerSetting = localStorageInfo.getStorageData(LOCAL_STORAGE_KEY.RETAILER_SETTING);
    const fieldNameForValidation = 'ZipCode';
    const selectedStore = selectedStoreState.store;

    const { updateThicknessOptions, updateSelectedDefaultThickness } = useContext(ThicknessContext);

    // clean up the thickness options array and the selected thickness option when the store is changed
    useEffect(() => {
        updateThicknessOptions([]);
        updateSelectedDefaultThickness(undefined);
    }, [selectedStore]);

    useEffect(() => {
        form.setFieldsValue({
            [fieldNameForValidation]: zipcodeFromLocation,
        });
    }, [zipcodeFromLocation]);

    const onZipCodeInput = () => {
        const error = form.getFieldError(fieldNameForValidation);
        if (!error.length) {
            return;
        }
        // Clear error message of field
        form.setFields([
            {
                name: fieldNameForValidation,
                errors: [],
            },
        ]);
    };

    const submitZipCode = (e: any) => {
        setTimeout(async () => {
            try {
                await form.validateFields();
                if (zipcode) {
                    showModal();
                } else {
                    updateZipcode(e);
                    onSubmit(e);
                }
            } catch {
                // TODO Error Handling
            }
        }, 0);
    };

    const onValidate = (rule: RuleObject) => {
        return validateZipCode(rule, form.getFieldValue(fieldNameForValidation), t);
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const onConfirmChangingZipCodeFromModal = () => {
        const zipCodeFromInput = form.getFieldValue(fieldNameForValidation);
        updateZipcode(zipCodeFromInput);
        onSubmit(zipCodeFromInput);

        setIsModalVisible(false);
        // flag to not trigger notifications when checking material and colors previously selected, when there has been already a zipcode introduced previously
        if (!isZipcodeSet) updateisZipcodeSet(true);
    };

    const onCancelChangingZipCodeFromModal = () => {
        setIsModalVisible(false);
        // set previous zipcode
        form.setFieldsValue({
            [fieldNameForValidation]: zipcode,
        });
    };

    const selectManualStore = (store: StoreModel) => {
        updateSelectedStoreByUser(store);
    };

    const ConfirmationModalFooter = () => {
        return (
            <>
                <div className="modal-button" onClick={onCancelChangingZipCodeFromModal}>
                    <div className="modal-btn-text"> {t('COMMON.NO')}</div>
                </div>
                <Divider type="vertical" className="divider" />
                <div className="modal-button" onClick={onConfirmChangingZipCodeFromModal}>
                    <div className="modal-btn-text"> {t('COMMON.YES')}</div>
                </div>
            </>
        );
    };

    const StoreItem = (props: StoreItemProps) => {
        const { store } = props;

        const completeAddress = store.address?.split(SEPARATOR_CHARACTER);
        const address = completeAddress ? completeAddress[0] : '';

        return (
            <Card
                className={`item-store ${selectedStore?.companyId === store.companyId ? 'selected' : ''}`}
                onClick={() => selectManualStore(store)}
            >
                <div className="bolder">{store.companyName}</div>
                <div>{address} </div>
                <div className="city-info">
                    {store.city}
                    {SEPARATOR_CHARACTER} {store.state} {store.zip}
                </div>
                <div className="bolder">{store.distance} mi.</div>
            </Card>
        );
    };

    return (
        <>
            <Form form={form} layout="vertical">
                <div className="container-submit">
                    <FormItem
                        className="label-input"
                        label={t('SCROLLABLE_AREA.ADDRESS_INFORMATION.ZIP_CODE')}
                        validateTrigger={false}
                        name="ZipCode"
                        rules={[{ validator: (_, value) => onValidate(_) }]}
                    >
                        <Input.Search
                            className="zipcode"
                            type="number"
                            min="0"
                            max="99999"
                            value={zipcode}
                            onChange={onZipCodeInput}
                            size="large"
                            allowClear
                            style={{ width: '12vw' }}
                            onKeyPress={preventNonNumericalInput}
                            onSearch={submitZipCode}
                            loading={loading}
                            enterButton
                        />
                    </FormItem>
                </div>
            </Form>
            <Modal
                className="zip-code-modal"
                title={t('SCROLLABLE_AREA.ADDRESS_INFORMATION.CONFIRMATION_MESSAGE')}
                visible={isModalVisible}
                closable={false}
                destroyOnClose={true}
                maskClosable={false}
                footer={<ConfirmationModalFooter />}
                centered={true}
            >
                <div className="description-modal">
                    {t('SCROLLABLE_AREA.ADDRESS_INFORMATION.DESCRIPTION_CONFIRMATION_MESSAGE')}
                </div>
            </Modal>

            {retailerSetting?.showStores && !loading && (
                <div className="container-stores">
                    {/* No store returned from server  */}
                    {zipcode != undefined && stores?.length === 0 && (
                        <div>{t('SCROLLABLE_AREA.ADDRESS_INFORMATION.NO_STORE')}</div>
                    )}
                    {stores?.map((store: StoreModel) => {
                        return <StoreItem key={store.companyId} store={store} />;
                    })}
                </div>
            )}
        </>
    );
}
