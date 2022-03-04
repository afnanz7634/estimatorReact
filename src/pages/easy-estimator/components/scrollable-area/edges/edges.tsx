import { CANVAS_OBJECT_TYPE_PREFIX, UNIT_MEASURE } from '@common/constants';
import { EdgeModel } from '@common/models';
import { CornerRadiusContext, DrawingShapeContext, FabricContext, ThicknessContext } from '@ee-context';
import { Divider, Spin } from 'antd';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CardItem } from '../../../../../core/components';
import drawingTool from '../design-countertop/drawer/drawingTool';
import './edges.scss';
import useEdges from './useEdges';

export interface EdgesProps {
    step: number;
    stepInfo: string;
}
export interface EdgeItemProps {
    edge: EdgeModel;
}

export interface EdgeRowProps {
    edgesArray: EdgeModel[];
}

export function Edges(props: EdgesProps) {
    const { t } = useTranslation();
    const { stepInfo, step } = props;
    const {
        edges,
        loading,
        selectedMaterial,
        zipcode,
        selectedEdge,
        updateSelectedEdgeByUser,
        twoCMArray,
        fourCMArray,
        displayDefaultEdges,
    } = useEdges();
    const { selectedCornerRadiusOnCardState } = useContext(CornerRadiusContext);
    const { canvas } = useContext(FabricContext);
    const { drawingShapes } = useContext(DrawingShapeContext);
    const { selectedThicknessOption } = useContext(ThicknessContext);
    const selectedCornerRadiusOnCard = selectedCornerRadiusOnCardState.cornerRadius;

    const selectManualEdge = (edge: EdgeModel) => {
        updateSelectedEdgeByUser(edge);
        if (selectedCornerRadiusOnCard && canvas) {
            drawingTool.removeObjectByName(canvas, CANVAS_OBJECT_TYPE_PREFIX.CORNER_RADIUS_CIRCLE);
        }
    };

    const EdgeItem = (props: EdgeItemProps) => {
        const { edge } = props;

        return (
            <div
                className={`image-container ${
                    drawingShapes?.length && selectedEdge?.productId === edge?.productId ? 'selected' : ''
                }`}
                onClick={() => selectManualEdge(edge)}
            >
                <div className="image-card ">
                    <img alt="edge" src={edge.imageUrl} />
                    <div className="card-name">
                        <div className="edge-name">{edge.name}</div>
                        <div className="edge-price">
                            {edge.price === 0 ? (
                                <>{t('COMMON.FREE_PRICE')}</>
                            ) : (
                                <>
                                    ${edge.price.toFixed(2)} {UNIT_MEASURE.EDGE}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const EdgeRow = (props: EdgeRowProps) => {
        const { edgesArray } = props;

        return (
            <>
                {edgesArray.map((edge: EdgeModel, id: number) => (
                    <EdgeItem key={id} edge={edge} />
                ))}
            </>
        );
    };

    const EdgeContent = () => {
        return (
            <div>
                {edges && !loading && displayDefaultEdges() ? (
                    <div className="edge-card-content">
                        <EdgeRow edgesArray={edges} />
                    </div>
                ) : (
                    <>
                        <div className="edge-card-content">
                            <EdgeRow edgesArray={twoCMArray} />
                        </div>
                        <Divider className="thickness-divider" />
                        <div className="edge-card-content">
                            <EdgeRow edgesArray={fourCMArray} />
                        </div>
                    </>
                )}
                {loading && <Spin style={{ fontSize: 24 }} />}
            </div>
        );
    };
    if (drawingShapes?.length && selectedMaterial && zipcode) {
        return (
            <CardItem
                id={step}
                infoIcon={{
                    title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                    content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
                }}
                title={t('SCROLLABLE_AREA.EDGE.TITLE')}
                stepInfo={stepInfo}
                description={t('SCROLLABLE_AREA.EDGE.DESCRIPTION')}
                disabled={false}
            >
                <EdgeContent />
            </CardItem>
        );
    } else {
        return <CardItem id={step}
                         infoIcon={{
                             title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                             content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
                         }} title={t('SCROLLABLE_AREA.EDGE.TITLE')} stepInfo={stepInfo} disabled={true} />;
    }
}
