import { UNIT_MEASURE } from '@common/constants';
import { CornerRadiusModel } from '@common/models';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { CardItem } from '../../../../../core/components';
import './corner-radius.scss';
import useCornerRadius from './useCornerRadius';

export interface CornerRadiusProps {
    step: number;
    stepInfo: string;
}
export interface CornerRadiusItemProps {
    cornerRadius: CornerRadiusModel;
}

export function CornerRadius(props: CornerRadiusProps) {
    const { t } = useTranslation();
    const { stepInfo, step } = props;
    const {
        loading,
        cornerRadii,
        selectedMaterial,
        drawingShapes,
        zipcode,
        selectedCornerRadiusOnCard,
        updateSelectedCornerRadiusByUser,
    } = useCornerRadius();

    const CornerRadiusItem = (props: CornerRadiusItemProps) => {
        const { cornerRadius } = props;
        const selectManualCornerRadius = (corner: CornerRadiusModel) => {
            updateSelectedCornerRadiusByUser(corner);
        };
        return (
            <div
                className={`image-container 
                ${
                    drawingShapes?.length && selectedCornerRadiusOnCard?.productId === cornerRadius?.productId
                        ? 'selected'
                        : ''
                }`}
                onClick={() => selectManualCornerRadius(cornerRadius)}
            >
                <div className="image-card">
                    <img alt="corner-radius" src={cornerRadius.imageUrl} />
                </div>
                <div className="card-name">
                    <div className="corner-radius-name">{cornerRadius.name}</div>
                    <div className="corner-radius-price">
                        {!cornerRadius.productId && !cornerRadius.price ? (
                            <>{t('COMMON.FREE_PRICE')}</>
                        ) : (
                            <>
                                ${cornerRadius.price.toFixed(2)} {UNIT_MEASURE.CORNER_RADIUS}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const CornerRadiiContent = () => {
        return (
            <>
                {cornerRadii && !loading && (
                    <div className="corner-radius-card-content">
                        {cornerRadii.map((cornerRadius: CornerRadiusModel, id: number) => (
                            <CornerRadiusItem key={id} cornerRadius={cornerRadius}></CornerRadiusItem>
                        ))}
                    </div>
                )}
                {loading && <Spin style={{ fontSize: 24 }} />}
            </>
        );
    };
    if (drawingShapes.length > 0 && selectedMaterial && zipcode) {
        return (
            <CardItem
                id={step}
                infoIcon={{
                    title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                    content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
                }}
                title={t('SCROLLABLE_AREA.CORNER_RADIUS.TITLE')}
                stepInfo={stepInfo}
                description={t('SCROLLABLE_AREA.CORNER_RADIUS.DESCRIPTION')}
                disabled={false}
            >
                <CornerRadiiContent />
            </CardItem>
        );
    } else {
        return (
            <CardItem
                title={t('SCROLLABLE_AREA.CORNER_RADIUS.TITLE')}
                stepInfo={stepInfo}
                disabled={true}
                id={step}
                infoIcon={{
                    title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                    content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
                }}
            />
        );
    }
}
