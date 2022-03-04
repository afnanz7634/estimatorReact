import { InfoCircleFilled } from '@ant-design/icons';
import { BACKSPLASH, BACKSPLASH_DEFAULT_VALUE, UNIT_MEASURE } from '@common/constants';
import { SideItemType } from '@common/enums';
import { ArrowInfo, DrawingShape, SideItemInfoModel } from '@common/models';
import { setDefaultSrc } from '@common/utils';
import { ColorContext, DrawingShapeContext, MaterialContext, ShapeContext } from '@ee-context';
import { Input, InputNumber, Space } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import { ReactElement, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateShapeByEdge } from '../../canvas/drawing-tool/utils/edit-dimension-helper';
import './shapeTabContent.scss';

export interface ExtraItemProps {
    onBlur: (value: string) => void;
}

interface ShapeTabProps {
    shape: DrawingShape;
    setModalDisplayed: (value: boolean) => void;
}

export const ShapeTabContent = (props: ShapeTabProps): ReactElement => {
    const { shape, setModalDisplayed } = props;

    const { selectedColorState } = useContext(ColorContext);
    const { selectedMaterialState } = useContext(MaterialContext);
    const { shapesSideItems, updateShapesSideItems, updateSelectedSideItem } = useContext(ShapeContext);

    const selectedMaterial = selectedMaterialState.material;
    const selectedColor = selectedColorState.color;

    const updateSideItem = (shape: DrawingShape, sideItem: SideItemInfoModel) => {
        if (!shape?.canvasObjectName) {
            return;
        }

        const sideItems = getSideItems(shape, sideItem.arrowInfo);
        const sideItemClone = sideItems.find((si) => si.sideType === sideItem.sideType);

        if (sideItemClone) {
            // clear
            sideItems.forEach((si) => {
                if (si.sideType !== sideItem.sideType) si.checked = false;
            });
            // copy props
            sideItemClone.checked = sideItem.checked;
            sideItemClone.backsplash = sideItem.backsplash;

            // update
            shapesSideItems[shape.canvasObjectName] = {
                ...shapesSideItems[shape.canvasObjectName],
                [`${sideItem.arrowInfo.label}`]: sideItems,
            };

            const sideItemsByEdge: Array<SideItemInfoModel> =
                shapesSideItems[shape.canvasObjectName][`${sideItem.arrowInfo.label}`];
            sideItemsByEdge.forEach((sideItemByEdge) => {
                if (sideItemByEdge.backsplash?.checked && !sideItemByEdge.checked) {
                    sideItemByEdge.backsplash = {
                        checked: false,
                        value: 0,
                    };
                }
            });

            updateShapesSideItems({ ...shapesSideItems });
        }
    };

    const getSideItems = (shape: DrawingShape, arrowInfo: ArrowInfo): Array<SideItemInfoModel> => {
        const cloneSideItems = [
            {
                id: 1,
                label: 'Wall_side',
                value: 'Wall side',
                sideType: SideItemType.WALL_SIDE,
                arrowInfo: arrowInfo,
                checked: false,
                backsplash: {
                    checked: false,
                    value: 0,
                },
            },
            {
                id: 2,
                label: 'Appliance_side',
                value: 'Appliance side',
                sideType: SideItemType.APPLIANCE_SIDE,
                arrowInfo: arrowInfo,
                checked: false,
            },
            {
                id: 3,
                label: 'Waterfall',
                value: 'Waterfall',
                sideType: SideItemType.WATERFALL,
                arrowInfo: arrowInfo,
                checked: false,
            },
        ];

        let sideItemsList = null;
        const shapeSideItems = shapesSideItems[shape.canvasObjectName || ''];
        if (shapeSideItems) {
            sideItemsList = shapeSideItems[`${arrowInfo.label}`];
        }

        return sideItemsList || cloneSideItems;
    };

    return (
        <div className="shape-content">
            <div className="shape-title-area">
                {selectedColor && selectedMaterial && (
                    <div className="text-area">
                        <img
                            alt="color"
                            className="shape-tab-color-image"
                            src={selectedColor.swatchImageUrl}
                            onError={setDefaultSrc}
                        />
                        <div>{`${selectedMaterial.description} / ${selectedColor.name}`}</div>
                    </div>
                )}
                <InfoCircleFilled className="info-icon" onClick={() => setModalDisplayed(true)} />
            </div>
            <div className="shape-side-area">
                {shape?.arrowsInfo
                    ?.filter((item) => !item.isInterior)
                    .sort((p1, p2) =>
                        (p1.label || '') > (p2.label || '') ? 1 : (p2.label || '') > (p1.label || '') ? -1 : 0,
                    )
                    .map((item, idx) => (
                        <SideItem
                            key={idx}
                            info={item}
                            shape={shape}
                            sideItemList={getSideItems(shape, item)}
                            updateSideItem={updateSideItem}
                            updateSelectedSideItem={updateSelectedSideItem}
                        />
                    ))}
            </div>
        </div>
    );
};

export interface SideItemProps {
    info: ArrowInfo;
    shape: DrawingShape;
    sideItemList: Array<SideItemInfoModel>;
    updateSideItem: (shape: DrawingShape, sideItem: SideItemInfoModel) => void;
    updateSelectedSideItem: (selectedSideItem: SideItemInfoModel) => void;
}

const SideItem = (props: SideItemProps) => {
    const { info, shape, sideItemList, updateSideItem, updateSelectedSideItem } = props;

    return (
        <div className="side-item" key={info.label}>
            <div className="side-title">{info.label}</div>

            <InputBoxCustom arrowInfo={info} shape={shape} />

            <Space direction="vertical">
                {sideItemList.map((sideItem: SideItemInfoModel, idx: number) => {
                    return (
                        <CheckBoxCustom
                            key={idx}
                            sideItem={sideItem}
                            shape={shape}
                            updateSideItem={updateSideItem}
                            updateSelectedSideItem={updateSelectedSideItem}
                        />
                    );
                })}
            </Space>
        </div>
    );
};

export interface CheckBoxCustomProps {
    sideItem: SideItemInfoModel;
    shape: DrawingShape;
    updateSideItem: (shape: DrawingShape, sideItem: SideItemInfoModel) => void;
    updateSelectedSideItem: (selectedSideItem: SideItemInfoModel) => void;
}

const CheckBoxCustom = (props: CheckBoxCustomProps) => {
    const { sideItem, shape, updateSideItem, updateSelectedSideItem } = props;
    const { t } = useTranslation();

    const ExtraBacksplashInputItem = (props: ExtraItemProps): ReactElement => {
        const [inputState, setInputState] = useState<string>(BACKSPLASH_DEFAULT_VALUE);
        const { onBlur } = props;

        return (
            <div className="extra-area">
                <div className="description extra-descr">
                    {t('SCROLLABLE_AREA.COUNTERTOP.HEIGHT')}&nbsp;({UNIT_MEASURE.SIDE_WALLS})
                </div>

                <Input
                    type="number"
                    className="side-input backsplash-input"
                    value={inputState}
                    defaultValue={BACKSPLASH_DEFAULT_VALUE}
                    min={'0.75'}
                    max={'60'}
                    maxLength={2}
                    onBlur={() => onBlur(inputState)}
                    onPressEnter={() => onBlur(inputState)}
                />
            </div>
        );
    };

    const handleBacksplashCheckBoxChangeEvent = (event: any) => {
        sideItem.backsplash = {
            checked: event.target.checked,
            value: Number(BACKSPLASH_DEFAULT_VALUE),
        };
        updateSelectedSideItem(sideItem);
        updateSideItem(shape, sideItem);
    };

    const onChangeBacksplashInput = () => {
        // TO DO:
        // update backsplash value
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const clonedSelectedSideItem = { ...sideItem };
        clonedSelectedSideItem.checked = event.target.checked;

        // in case backsplash is selected when uncheck wall side option
        if (clonedSelectedSideItem.backsplash?.checked) {
            clonedSelectedSideItem.backsplash!.checked = event.target.checked;
            clonedSelectedSideItem.backsplash!.value = 0;
        }

        updateSelectedSideItem(clonedSelectedSideItem);
        updateSideItem(shape, clonedSelectedSideItem);
    };

    return (
        <div className="checkbox-container">
            <input
                type="checkbox"
                className="checkbox-round"
                onChange={handleChange}
                value={sideItem.value}
                name={`customrb${sideItem.id}-${sideItem.label}`}
                checked={sideItem.checked}
            />
            <label>{sideItem.value}</label>
            {sideItem.sideType === SideItemType.WALL_SIDE && sideItem.checked ? (
                <div className={`extra-check-box ${sideItem?.backsplash?.checked ? 'checkedBacksplash' : ''}`}>
                    <Checkbox
                        checked={sideItem?.backsplash?.checked}
                        onChange={handleBacksplashCheckBoxChangeEvent}
                        className="backsplash-style"
                    >
                        {BACKSPLASH}
                        {sideItem?.backsplash?.checked ? (
                            <ExtraBacksplashInputItem onBlur={onChangeBacksplashInput} />
                        ) : null}
                    </Checkbox>
                </div>
            ) : null}
            {sideItem.sideType === SideItemType.WATERFALL && sideItem.checked ? (
                <div className="extra-area">
                    <div className="description inside">
                        {t('SCROLLABLE_AREA.COUNTERTOP.HEIGHT')}&nbsp;({UNIT_MEASURE.SIDE_WALLS})
                    </div>
                    <Input className="side-input waterfall-input" />
                </div>
            ) : null}
        </div>
    );
};

export interface InputBoxCustomProps {
    arrowInfo: ArrowInfo;
    shape: DrawingShape;
}

const InputBoxCustom = (props: InputBoxCustomProps) => {
    const { arrowInfo, shape } = props;
    const [arrowLength, setArrowLength] = useState(arrowInfo?.length!);

    const { drawingShapes, updateDrawingShapes, updateRedrawCanvasFlag } = useContext(DrawingShapeContext);

    const { t } = useTranslation();

    const handleBlur = () => {
        const newArrow = { ...arrowInfo, length: arrowLength };
        updateShapeByEdge(newArrow, shape);
        updateDrawingShapes([...drawingShapes]);
        updateRedrawCanvasFlag(true);
    };

    // restrict lengths to between 1 and 300 inches (EE-942)
    const adjustValue = (value: number): number => {
        let adjustedValue = value;
        if (adjustedValue < 1) adjustedValue = 1;
        if (adjustedValue > 300) adjustedValue = 300;
        return adjustedValue;
    };

    const handleOnChange = (value: number) => {
        const adjustedValue = adjustValue(value);
        setArrowLength(adjustedValue);
    };

    return (
        <div className="input-area">
            <div className="description">
                {t('SCROLLABLE_AREA.COUNTERTOP.LENGTH')}&nbsp;({UNIT_MEASURE.SIDE_WALLS})
            </div>
            <InputNumber
                type={'number'}
                value={arrowInfo.length}
                onChange={handleOnChange}
                onPressEnter={handleBlur}
                onBlur={handleBlur}
            />
        </div>
    );
};
