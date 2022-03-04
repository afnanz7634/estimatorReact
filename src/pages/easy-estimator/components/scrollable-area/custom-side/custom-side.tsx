import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { CardItem } from '../../../../../core/components';
import useCustomSides from './useCustomSides';
import { PredefinedCustomSide } from '@common/models/predefined-custom-side.model';
import './custom-sides.scss';
import { PredefinedCustomSideType } from '@common/enums';

export interface CustomSideProps {
    step: number;
    stepInfo: string;
}
export interface CustomSideItemProps {
    customSide: PredefinedCustomSide;
}

export function CustomSide(props: CustomSideProps) {
    const { t } = useTranslation();
    const { stepInfo, step } = props;
    const { loading, customSides, selectedCustomSide, updateSelectedCustomSide, isCustomSideAvailable } =
        useCustomSides();

    const selectCustomSide = (customSide: PredefinedCustomSide) => {
        if (customSide.type !== PredefinedCustomSideType.REMOVE_CUSTOM_SIDE) {
            updateSelectedCustomSide(customSide);
        }
    };

    const CustomSideItem = (props: CustomSideItemProps) => {
        const { customSide } = props;

        return (
            <div
                className={`image-container ${
                    customSide.type === PredefinedCustomSideType.REMOVE_CUSTOM_SIDE ? 'disabled' : ''
                } ${customSide.id === selectedCustomSide?.id ? 'selected' : ''}`}
            >
                <div className="image-card" onClick={() => selectCustomSide(customSide)}>
                    <img alt="custom-side" src={customSide.image} />
                    <div className="card-name">
                        <div className="custom-side-name">{customSide.title}</div>
                    </div>
                </div>
            </div>
        );
    };

    const CustomSideContent = () => {
        return (
            <div>
                {customSides && !loading && (
                    <div className="custom-side-card-content">
                        {customSides.map((customSide: PredefinedCustomSide, id: number) => (
                            <CustomSideItem key={id} customSide={customSide} />
                        ))}
                    </div>
                )}
                {loading && <Spin style={{ fontSize: 24 }} />}
            </div>
        );
    };

    return (
        <>
            {isCustomSideAvailable() ? (
                <CardItem
                    id={step}
                    infoIcon={{
                        title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                        content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
                    }}
                    title={t('SCROLLABLE_AREA.CUSTOM_SIDE.TITLE')}
                    stepInfo={stepInfo}
                    description={t('SCROLLABLE_AREA.CUSTOM_SIDE.DESCRIPTION')}
                >
                    <CustomSideContent />
                </CardItem>
            ) : (
                <CardItem
                    id={step}
                    infoIcon={{
                        title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                        content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
                    }}
                    title={t('SCROLLABLE_AREA.CUSTOM_SIDE.TITLE')}
                    stepInfo={stepInfo}
                    disabled={true}
                />
            )}
        </>
    );
}
