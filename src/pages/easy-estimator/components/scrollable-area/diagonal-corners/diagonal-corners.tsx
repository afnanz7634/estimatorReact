import { CANVAS_OBJECT_TYPE_PREFIX, REMOVE_DIAGONAL_CORNER, UNIT_MEASURE } from '@common/constants';
import { DiagonalCornerModel } from '@common/models';
import { CornerRadiusContext, DrawingShapeContext, FabricContext } from '@ee-context';
import { Spin } from 'antd';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CardItem } from '../../../../../core/components';
import drawingTool from '../design-countertop/drawer/drawingTool';
import './diagonal-corners.scss';
import useDiagonalCorners from './useDiagonalCorners';

export interface DiagonalCornersProps {
    step: number;
    stepInfo: string;
}
export interface DiagonalCornerItemProps {
    diagonalCorner: DiagonalCornerModel;
}

export function DiagonalCorners(props: DiagonalCornersProps) {
    const { t } = useTranslation();
    const { stepInfo, step } = props;
    const {
        diagonalCorners,
        loading,
        selectedDiagonalCorner,
        updateSelectedDiagonalCorner,
        isDiagonalCornerOptionAvailable,
    } = useDiagonalCorners();

    const { drawingShapes } = useContext(DrawingShapeContext);
    const { selectedCornerRadiusOnCardState } = useContext(CornerRadiusContext);
    const { canvas } = useContext(FabricContext);
    const selectedCornerRadiusOnCard = selectedCornerRadiusOnCardState.cornerRadius;

    const selectManualDiagonalCorner = (diagonalCorner: DiagonalCornerModel) => {
        if (diagonalCorner.name !== REMOVE_DIAGONAL_CORNER) {
            updateSelectedDiagonalCorner(diagonalCorner);
        }
        if (selectedCornerRadiusOnCard && canvas) {
            drawingTool.removeObjectByName(canvas, CANVAS_OBJECT_TYPE_PREFIX.CORNER_RADIUS_CIRCLE);
        }
    };

    const DiagonalCornerItem = (props: DiagonalCornerItemProps) => {
        const { diagonalCorner } = props;

        return (
            <div
                className={`image-container ${diagonalCorner.name === REMOVE_DIAGONAL_CORNER ? 'disabled' : ''} ${
                    drawingShapes?.length && selectedDiagonalCorner?.name === diagonalCorner?.name ? 'selected' : ''
                }`}
                onClick={() => selectManualDiagonalCorner(diagonalCorner)}
            >
                <div className="image-card">
                    <img alt="diagonal-corner" src={diagonalCorner.imageUrl} />
                </div>
                <div className="card-name">
                    <div className="diagonal-corner-name">{diagonalCorner.name}</div>
                    {diagonalCorner.name !== REMOVE_DIAGONAL_CORNER && (
                        <div className="diagonal-corner-price">
                            {diagonalCorner.price === 0 || diagonalCorner.price === null ? (
                                <>{t('COMMON.FREE_PRICE')}</>
                            ) : (
                                <>
                                    ${diagonalCorner.price.toFixed(2)} {UNIT_MEASURE.DIAGONAL_CORNER}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const DiagonalCornerContent = () => {
        return (
            <div>
                {diagonalCorners && !loading && (
                    <div className="diagonal-corner-card-content">
                        {diagonalCorners.map((diagonalCorner: DiagonalCornerModel, id: number) => (
                            <DiagonalCornerItem key={id} diagonalCorner={diagonalCorner} />
                        ))}
                    </div>
                )}
                {loading && <Spin style={{ fontSize: 24 }} />}
            </div>
        );
    };

    return (
        <>
            {isDiagonalCornerOptionAvailable() ? (
                <CardItem
                    id={step}
                    infoIcon={{
                        title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                        content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
                    }}
                    title={t('SCROLLABLE_AREA.DIAGONAL_CORNER.TITLE')}
                    stepInfo={stepInfo}
                    description={t('SCROLLABLE_AREA.DIAGONAL_CORNER.DESCRIPTION')}
                >
                    <DiagonalCornerContent />
                </CardItem>
            ) : (
                <CardItem id={step}
                          infoIcon={{
                              title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                              content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
                          }} title={t('SCROLLABLE_AREA.DIAGONAL_CORNER.TITLE')} stepInfo={stepInfo} disabled={true} />
            )}
        </>
    );
}
