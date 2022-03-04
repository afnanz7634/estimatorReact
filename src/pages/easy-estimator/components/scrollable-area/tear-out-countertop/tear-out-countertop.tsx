import { Button, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { CardItem } from '../../../../../core/components';
import useTearOutCountertop from './useTearOutCountertop';
import './tear-out-countertop.scss';
import { ReactElement, useContext, useState } from 'react';
import { TearOutCountertopModel } from '@common/models';
import { FREE_TEAR_OUT, UNIT_MEASURE } from '@common/constants';
import { InputNumber } from 'antd';
import { PriceContext } from '@ee-context';

export interface TearOutsProps {
    step: number;
    stepInfo: string;
}
export interface TearOutItemProps {
    tearOut: TearOutCountertopModel;
}

export function TearOutCountertop(props: TearOutsProps): ReactElement {
    const { t } = useTranslation();
    const { stepInfo, step } = props;
    const { loading, tearOuts, areTearOutsAvailable, selectedTearOut, updateSelectedTearOut } = useTearOutCountertop();
    const { countertopAreaQty } = useContext(PriceContext);

    const selectTearOut = (tearOut: TearOutCountertopModel) => {
        const selectedTearOutsMap = new Map(selectedTearOut);

        if (tearOut.name !== FREE_TEAR_OUT) {
            Array.from(selectedTearOutsMap.keys()).forEach((value) => {
                if ((value as TearOutCountertopModel).name === FREE_TEAR_OUT) {
                    selectedTearOutsMap.delete(value);
                    return;
                }
            });
        }

        if (tearOut.name === FREE_TEAR_OUT) {
            Array.from(selectedTearOutsMap.entries()).forEach((value) => {
                if ((value[0] as TearOutCountertopModel).name !== FREE_TEAR_OUT) {
                    selectedTearOutsMap.delete(value[0]);
                }
            });
        }

        if (selectedTearOut.has(tearOut)) {
            selectedTearOutsMap.delete(tearOut);
            updateSelectedTearOut(selectedTearOutsMap);
            return;
        }

        selectedTearOutsMap.set(tearOut, countertopAreaQty);
        updateSelectedTearOut(selectedTearOutsMap);
    };

    const updateQuantity = (tearOut: TearOutCountertopModel, newQuantity: number) => {
        if (newQuantity < 1) {
            return;
        }
        const newMap = new Map(selectedTearOut);
        newMap.set(tearOut, newQuantity);
        updateSelectedTearOut(newMap);
    };

    const changeProductQuantity = (tearOut: TearOutCountertopModel, amount: number): void => {
        const newMap = new Map(selectedTearOut);
        const prevQuantity = newMap.get(tearOut) as number;
        const updatedQuantity = prevQuantity + amount;
        if (updatedQuantity > 0) {
            newMap.set(tearOut, updatedQuantity);
            updateSelectedTearOut(newMap);
        }
    };

    const TearOutQuantity = (props: { tearOut: TearOutCountertopModel; quantity: number }) => {
        const [productQuantity, setProductQuantity] = useState(props.quantity);

        return (
            <div className="tear-out-quantity">
                <Button
                    type={'text'}
                    onClick={(e) => {
                        e.stopPropagation();
                        changeProductQuantity(props.tearOut, -1);
                    }}
                >
                    -
                </Button>
                <InputNumber
                    type={'number'}
                    min={0}
                    value={props.quantity}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(value) => setProductQuantity(value)}
                    onPressEnter={() => updateQuantity(props.tearOut, productQuantity)}
                    onBlur={() => updateQuantity(props.tearOut, productQuantity)}
                />
                {UNIT_MEASURE.TEAR_OUT}
                <Button
                    type={'text'}
                    onClick={(e) => {
                        e.stopPropagation();
                        changeProductQuantity(props.tearOut, 1);
                    }}
                >
                    +
                </Button>
            </div>
        );
    };

    const TearOutItem = (props: TearOutItemProps) => {
        const { tearOut } = props;

        return (
            <div
                className={`${selectedTearOut?.has(tearOut) ? 'selected' : ''} ${
                    selectedTearOut &&
                    selectedTearOut.has(tearOut) &&
                    selectedTearOut &&
                    Array.from(selectedTearOut.keys()).filter(
                        (value) => (value as TearOutCountertopModel).name === FREE_TEAR_OUT,
                    ).length === 0
                        ? 'add-quantity'
                        : ''
                } image-container`}
                onClick={() => selectTearOut(tearOut)}
            >
                <div className="image-card">
                    <img alt="tear-out" src={tearOut.imageUrl} />
                    <div className="card-name">
                        <div className="tear-out-name">{tearOut.name}</div>
                        {tearOut.name !== FREE_TEAR_OUT && (
                            <>
                                <div className="tear-out-price">
                                    {tearOut.price === 0 || tearOut.price === null ? (
                                        <>{t('COMMON.FREE_PRICE')}</>
                                    ) : (
                                        <>
                                            ${tearOut.price.toFixed(2)} {UNIT_MEASURE.TEAR_OUT}
                                        </>
                                    )}
                                </div>
                                {selectedTearOut?.has(tearOut) && (
                                    <TearOutQuantity tearOut={tearOut} quantity={selectedTearOut.get(tearOut)} />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const TearOutContent = () => {
        return (
            <div>
                {tearOuts && !loading && (
                    <div className="tear-out-card-content">
                        {tearOuts.map((tearOut: TearOutCountertopModel, id: number) => (
                            <TearOutItem key={id} tearOut={tearOut} />
                        ))}
                    </div>
                )}
                {loading && <Spin style={{ fontSize: 24 }} />}
            </div>
        );
    };

    return (
        <>
            {areTearOutsAvailable() ? (
                <CardItem
                    id={step}
                    infoIcon={{
                        title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                        content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
                    }}
                    title={t('SCROLLABLE_AREA.TEAR_OUT_COUNTERTOP.TITLE')}
                    stepInfo={stepInfo}
                    description={t('SCROLLABLE_AREA.TEAR_OUT_COUNTERTOP.DESCRIPTION')}
                >
                    <TearOutContent />
                </CardItem>
            ) : (
                <CardItem
                    id={step}
                    infoIcon={{
                        title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                        content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
                    }}
                    title={t('SCROLLABLE_AREA.TEAR_OUT_COUNTERTOP.TITLE')}
                    stepInfo={stepInfo}
                    disabled={true}
                />
            )}
        </>
    );
}
