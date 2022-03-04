import Icon from '@ant-design/icons';
import { DRAWING_STATE, DRAWING_TABS } from '@common/constants';
import { ColorModel, MaterialModel, PredefinedShape } from '@common/models';
import { setDefaultSrc } from '@common/utils';
import { ColorContext, MaterialContext, ShapeContext, ZipCodeContext } from '@ee-context';
import { Tabs, Tooltip } from 'antd';
import React, { ReactElement, useContext } from 'react';
import useFreeDrawer from '../toolbar/free-drawer/freeDrawer';
import colors from './colors.module.scss';
import './drawing-tabs.scss';
import AddShapeIcon from '/public/assets/icons/add_Shape.svg';
import DrawIcon from '/public/assets/icons/draw.svg';

export interface ShapeItemProps {
    shape: PredefinedShape;
}

export interface SelectedMaterialColorProps {
    selectedMaterial: MaterialModel;
    selectedColor: ColorModel;
}

export interface DrawingTabsProps {
    shapeContainer: React.RefObject<HTMLDivElement>;
}

export const SelectedMaterialColor = (props: SelectedMaterialColorProps) => {
    const { selectedColor, selectedMaterial } = props;
    return (
        <div className="selection-title-area">
            {selectedColor && selectedMaterial && (
                <div className="text-area">
                    <img
                        alt="color"
                        className="selected-color-image"
                        src={selectedColor.swatchImageUrl}
                        onError={setDefaultSrc}
                    />
                    <div>{`${selectedMaterial.description} / ${selectedColor.name}`}</div>
                </div>
            )}
        </div>
    );
};

export const getEnabledDisabledBehaviour = (drawingState: string) => {
    return drawingState ? colors.secondaryColor : colors.primaryColor;
};

export function DrawingTabs(props: DrawingTabsProps): ReactElement {
    const { TabPane } = Tabs;
    const { shapeContainer } = props;
    const { shapes, selectedShape, updateSelectedShape, updateDrawingStatus, drawingState } = useContext(ShapeContext);
    const { zipcode } = useContext(ZipCodeContext);
    const { selectedMaterialState } = useContext(MaterialContext);
    const { selectedColorState } = useContext(ColorContext);
    const { activate } = useFreeDrawer();

    const selectedMaterial = selectedMaterialState.material;
    const selectedColor = selectedColorState.color;
    const { isFreeDrawingState, isShapeGeneratedState } = drawingState;

    const onTabClick = (key: string) => {
        if (key === DRAWING_STATE.FREE_DRAWING) {
            updateDrawingStatus({ isShapeGeneratedState: false, isFreeDrawingState: true });
            activate({ isShapeGeneratedState: false, isFreeDrawingState: true });
        } else if (key === DRAWING_STATE.PREDEFINED_SHAPES) {
            updateDrawingStatus({ isShapeGeneratedState: true, isFreeDrawingState: false });
        }
    };

    const ShapeItem = (props: ShapeItemProps) => {
        const { shape } = props;
        const selectShape = () => {
            if (selectedColor && zipcode) updateSelectedShape(shape);
        };

        return (
            <div className="shape-container" onClick={() => selectShape()}>
                <img
                    className={`shape-image ${selectedShape?.id === shape.id && selectedColor ? 'selected' : ''}`}
                    alt="predefine-shape"
                    src={shape.image}
                />
                <div className="shape-title">{shape.title}</div>
            </div>
        );
    };

    const ShapeMenu = () => {
        return (
            <div className="add-layout-area">
                <SelectedMaterialColor selectedColor={selectedColor} selectedMaterial={selectedMaterial} />
                <div ref={shapeContainer} className="shape-menu">
                    {shapes?.map((shape: PredefinedShape) => {
                        return <ShapeItem key={shape.id} shape={shape} />;
                    })}
                </div>
            </div>
        );
    };

    return (
        <Tabs defaultActiveKey="predefined-shapes" className="drawing-tabs" onTabClick={onTabClick}>
            <TabPane
                tab={
                    <Tooltip
                        title={DRAWING_TABS.PREDEFINED_SHAPE}
                        color={getEnabledDisabledBehaviour(isShapeGeneratedState)}
                    >
                        <Icon
                            className="predefined-icon"
                            component={() => (
                                <AddShapeIcon
                                    fill={getEnabledDisabledBehaviour(isShapeGeneratedState)}
                                    stroke={getEnabledDisabledBehaviour(isShapeGeneratedState)}
                                />
                            )}
                        />
                    </Tooltip>
                }
                key={DRAWING_STATE.PREDEFINED_SHAPES}
                className="predefined-shapes-tab"
                disabled={!zipcode}
            >
                <ShapeMenu />
            </TabPane>
            <TabPane
                tab={
                    <Tooltip title={DRAWING_TABS.DRAW_LAYOUT} color={getEnabledDisabledBehaviour(isFreeDrawingState)}>
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
                disabled={!zipcode}
            >
                <div className="draw-layout-tab">
                    <SelectedMaterialColor selectedColor={selectedColor} selectedMaterial={selectedMaterial} />
                </div>
            </TabPane>
        </Tabs>
    );
}
