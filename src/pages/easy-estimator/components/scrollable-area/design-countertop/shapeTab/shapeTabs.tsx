import Icon, { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { DRAWING_STATE, DRAWING_TABS } from '@common/constants';
import { DrawingShape } from '@common/models';
import { ColorContext, DrawingShapeContext, MaterialContext, ShapeContext } from '@ee-context';
import { Tabs, Tooltip } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { forwardRef, useContext, useEffect, useState } from 'react';
import colors from '../drawing-tabs/colors.module.scss';
import { getEnabledDisabledBehaviour, SelectedMaterialColor } from '../drawing-tabs/drawing-tabs';
import useFreeDrawer from '../toolbar/free-drawer/freeDrawer';
import { ShapeTabContent } from './shapeTabContent/shapeTabContent';
import AddShapeIcon from '/public/assets/icons/add_Shape.svg';
import DrawIcon from '/public/assets/icons/draw.svg';

export interface ShapeTabsProps {
    shapeTabToggleHandler: (collapsed: boolean) => void;
    setModalDisplayed: React.Dispatch<React.SetStateAction<boolean>>;
    isModalDisplayed: boolean;
}

const ShapeTabsComponent = (props: ShapeTabsProps, ref: any) => {
    const { TabPane } = Tabs;
    const [collapsed, setCollapsed] = useState(false);
    const [activeTabIndex, setActiveTabIndex] = useState(DRAWING_STATE.FIRST_SHAPE);

    const { drawingShapes, activeDrawingShape, updateActiveDrawingShape, updateRedrawCanvasFlag } =
        useContext(DrawingShapeContext);
    const { drawingState, updateDrawingStatus } = useContext(ShapeContext);
    const { selectedMaterialState } = useContext(MaterialContext);
    const { selectedColorState } = useContext(ColorContext);

    const selectedMaterial = selectedMaterialState.material;
    const selectedColor = selectedColorState.color;
    const { isFreeDrawingState, isShapeGeneratedState } = drawingState;
    const { activate } = useFreeDrawer();
    const { shapeTabToggleHandler, setModalDisplayed } = props;

    useEffect(() => {
        if (activeDrawingShape) {
            const index = drawingShapes.findIndex(
                (shape: DrawingShape) => shape?.canvasObjectName == activeDrawingShape?.canvasObjectName,
            );

            if (isFreeDrawingState) {
                setActiveTabIndex(DRAWING_STATE.FREE_DRAWING);
            } else if (index >= 0) {
                setActiveTabIndex((index + 1).toString());
            }
        }
    }, [activeDrawingShape, drawingState.isFreeDrawingState]);

    const onTabBtnClick = (activeKey: string) => {
        if (activeKey === DRAWING_STATE.FREE_DRAWING) {
            updateDrawingStatus({ isShapeGeneratedState: false, isFreeDrawingState: true });
            if (isShapeGeneratedState) activate({ isShapeGeneratedState: false, isFreeDrawingState: true });
        } else {
            updateDrawingStatus({ isShapeGeneratedState: true, isFreeDrawingState: false });
            if (isFreeDrawingState) activate({ isShapeGeneratedState: true, isFreeDrawingState: false });
            if (activeKey !== DRAWING_STATE.PREDEFINED_SHAPES)
                updateActiveDrawingShape(drawingShapes[parseInt(activeKey) - 1]);
            updateRedrawCanvasFlag(true);
        }
        setActiveTabIndex(activeKey);
        updateRedrawCanvasFlag(false);
    };

    const CustomTrigger = () => (
        <div className="shape-tab-collapse">
            {!collapsed && <RightOutlined />}
            {collapsed && <LeftOutlined />}
        </div>
    );

    const onCollapse = (collapse: boolean) => {
        setCollapsed(collapse);
        shapeTabToggleHandler(collapse);
    };

    const getSelectedColorbyActiveTabIndex = (drawingState: string, index: number) => {
        return drawingState && activeTabIndex === (index + 1).toString() ? colors.secondaryColor : colors.primaryColor;
    };

    return (
        <Sider
            className="drawing-tab-area"
            onCollapse={onCollapse}
            theme="light"
            width={290}
            breakpoint="sm"
            collapsedWidth={0}
            collapsible
            trigger={<CustomTrigger />}
            reverseArrow={true}
            ref={ref}
        >
            <Tabs
                defaultActiveKey={isFreeDrawingState ? DRAWING_STATE.FREE_DRAWING : DRAWING_STATE.FIRST_SHAPE}
                activeKey={activeTabIndex}
                onChange={onTabBtnClick}
            >
                {drawingShapes?.map((dShape: DrawingShape, index: number) => {
                    return (
                        <TabPane
                            tab={
                                <Tooltip
                                    title={dShape?.label}
                                    color={getSelectedColorbyActiveTabIndex(isShapeGeneratedState, index)}
                                >
                                    <div
                                        style={{
                                            color: getSelectedColorbyActiveTabIndex(isShapeGeneratedState, index),
                                        }}
                                    >
                                        {dShape?.label}
                                    </div>
                                </Tooltip>
                            }
                            key={index + 1}
                            className="shape-tab"
                            forceRender={true}
                        >
                            <ShapeTabContent shape={dShape} setModalDisplayed={setModalDisplayed} />
                        </TabPane>
                    );
                })}

                <TabPane
                    tab={
                        <Tooltip
                            title={DRAWING_TABS.PREDEFINED_SHAPE}
                            color={getEnabledDisabledBehaviour(isShapeGeneratedState)}
                        >
                            <Icon
                                className="predefined-shape-icon"
                                component={() => (
                                    <AddShapeIcon
                                        fill={colors.primaryColor}
                                        stroke={colors.primaryColor}
                                        opacity={'0.5'}
                                    />
                                )}
                            />
                        </Tooltip>
                    }
                    key={DRAWING_STATE.PREDEFINED_SHAPES}
                    className="predefined-shape-tab"
                    disabled={true}
                >
                    {/* TO DO: Add a new predefined layout*/}
                </TabPane>
                <TabPane
                    tab={
                        <Tooltip
                            title={DRAWING_TABS.DRAW_LAYOUT}
                            color={getEnabledDisabledBehaviour(isFreeDrawingState)}
                        >
                            <Icon
                                className="draw-icon"
                                component={() => (
                                    <DrawIcon
                                        fill={getEnabledDisabledBehaviour(isFreeDrawingState)}
                                        stroke={getEnabledDisabledBehaviour(isFreeDrawingState)}
                                    />
                                )}
                            />
                        </Tooltip>
                    }
                    key={DRAWING_STATE.FREE_DRAWING}
                    className="draw-layout-tab"
                >
                    <SelectedMaterialColor selectedColor={selectedColor} selectedMaterial={selectedMaterial} />
                </TabPane>
            </Tabs>
        </Sider>
    );
};

export const ShapeTabs = forwardRef(ShapeTabsComponent);
