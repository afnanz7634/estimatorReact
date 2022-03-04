import Icon from '@ant-design/icons';
import ConfigurableModal from '@core/components/modal/modal';
import {
    ColorContext,
    DrawingShapeContext,
    EdgeContext,
    MaterialContext,
    ShapeContext,
    ZipCodeContext
} from '@ee-context';
import { Card, Spin, Tabs } from 'antd';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResizeDetector } from 'react-resize-detector';
import './design-countertop.scss';
import colors from './drawing-tabs/colors.module.scss';
import { DrawingTabs } from './drawing-tabs/drawing-tabs';
import { FabricCanvas } from './fabCanvas/fabricCanvas';
import { ShapeTabs } from './shapeTab/shapeTabs';
import AddShapeIcon from '/public/assets/icons/add_Shape.svg';
import DrawIcon from '/public/assets/icons/draw.svg';

export interface DesignCountertopProps {
    stepInfo: string;
}

export function DesignCountertop(props: DesignCountertopProps) {
    const { TabPane } = Tabs;
    const { t } = useTranslation();
    const { stepInfo } = props;

    const shapeContainer = useRef<HTMLDivElement>(null);
    const shapeTabContainer = useRef<HTMLDivElement>(null);

    const { isVisibleShapeTab, updateIsVisibleShapeTabStatus, drawingState } = useContext(ShapeContext);
    const { zipcode } = useContext(ZipCodeContext);
    const { drawingShapes } = useContext(DrawingShapeContext);
    const { selectedMaterialState } = useContext(MaterialContext);
    const { selectedColorState } = useContext(ColorContext);
    const [canvasWidth, setCanvasWidth] = useState(2000);
    const [shapeTapWidth, setShapeTapWidth] = useState(0);

    const { isFreeDrawingState } = drawingState;
    const selectedMaterial = selectedMaterialState.material;
    const selectedColor = selectedColorState.color;

    useEffect(() => {
        if (!selectedColor || !selectedMaterial || !drawingShapes || drawingShapes.length == 0) {
            updateIsVisibleShapeTabStatus(false);
        } else if (drawingShapes && drawingShapes.length > 0) {
            updateIsVisibleShapeTabStatus(true);
        }
    }, [drawingShapes, selectedColor, selectedMaterial]);

    useEffect(() => {
        if (shapeTabContainer && shapeTabContainer.current) {
            setShapeTapWidth(shapeTabContainer.current.offsetWidth);
        }
        onResize();
    }, [isVisibleShapeTab]);

    //  TODO this is needed to resize manually in the future
    const onResize = useCallback(() => {
        const width = ref.current.offsetWidth;
        if (shapeContainer && shapeContainer.current) {
            setCanvasWidth(width - (shapeContainer.current.offsetWidth || 0));
        } else if (shapeTabContainer && shapeTabContainer.current) {
            setCanvasWidth(width - (shapeTabContainer.current.offsetWidth || 0));
        }
    }, []);

    const { ref } = useResizeDetector({
        handleHeight: false,
        refreshMode: 'debounce',
        refreshRate: 1,
        onResize,
    });

    const [isModalDisplayed, setModalDisplayed] = useState(false);

    const StepInfo = () => {
        return (
            <>
                {stepInfo ? <span className="step-counter"> ({stepInfo}) </span> : <Spin className="loading-spinner" />}
            </>
        );
    };

    const shapeTabToggleHandler = (collapsed: boolean) => {
        if (collapsed) {
            setCanvasWidth(ref.current.offsetWidth);
        } else {
            setCanvasWidth(ref.current.offsetWidth - shapeTapWidth);
        }
    };

    return (
        <Card className={`design-countertop-card modal-mount-0 ${!zipcode ? 'disabled' : ''}`}>
            <Tabs defaultActiveKey="design-countertop">
                <TabPane
                    tab={
                        <span>
                            {t('SCROLLABLE_AREA.COUNTERTOP.TITLE')} <StepInfo />
                        </span>
                    }
                    key="design-countertop"
                    className="design-countertop-container"
                    disabled={!zipcode}
                >
                    <div className="drawing-area" ref={ref}>
                        {drawingShapes?.length === 0 && !isFreeDrawingState ? (
                            <div className="canvas-descriptor">
                                <div className="description">
                                    {t('SCROLLABLE_AREA.COUNTERTOP.PREDEFINED_SHAPE_DESCRIPTION')}
                                    <Icon
                                        className="draw-icon"
                                        component={() => (
                                            <AddShapeIcon
                                                fill={colors.descriptionColor}
                                                stroke={colors.descriptionColor}
                                            />
                                        )}
                                    />
                                    <br></br>
                                    {t('SCROLLABLE_AREA.COUNTERTOP.FREE_DRAW_DESCRIPTION')}
                                    <Icon
                                        className="draw-icon"
                                        component={() => (
                                            <DrawIcon fill={colors.descriptionColor} stroke={colors.descriptionColor} />
                                        )}
                                    />
                                </div>
                            </div>
                        ) : null}
                        <div className="canvas-wrapper">
                            <FabricCanvas width={canvasWidth} height={450} />
                            <EdgePreviewer />
                        </div>
                        {isVisibleShapeTab ? (
                            <ShapeTabs
                                shapeTabToggleHandler={shapeTabToggleHandler}
                                ref={shapeTabContainer}
                                setModalDisplayed={setModalDisplayed}
                                isModalDisplayed={isModalDisplayed}
                            />
                        ) : (
                            <DrawingTabs shapeContainer={shapeContainer} />
                        )}
                    </div>
                </TabPane>
            </Tabs>
            <ConfigurableModal
                title={'SCROLLABLE_AREA.COUNTERTOP.MODAL_DESCRIPTION'}
                isVisible={isModalDisplayed}
                onClose={setModalDisplayed}
                container=".modal-mount-0"
                content={
                    <img
                        className="modal-image"
                        src={'./public/assets/images/CountertopOptions/waterfall_ctop_diagram.svg'}
                        alt="countertop-options-preview"
                    />
                }
            />
        </Card>
    );
}

const EdgePreviewer = () => {
    const { drawingShapes } = useContext(DrawingShapeContext);
    const { selectedEdgeState } = useContext(EdgeContext);
    const selectedEdge = selectedEdgeState.edge;

    if (selectedEdge && drawingShapes && drawingShapes.length) {
        return (
            <div className="edge-previewer">
                <img alt="edge-previewer" src={selectedEdge.imageUrl} />
                <div className="edge-name">{selectedEdge.name}</div>
            </div>
        );
    } else {
        return null;
    }
};
