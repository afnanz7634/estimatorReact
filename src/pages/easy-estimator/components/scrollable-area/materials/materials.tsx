import { UNIT_MEASURE } from '@common/constants';
import { PriceMode } from '@common/enums';
import { MaterialModel } from '@common/models';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import CardItem from '../../../../../core/components/card-item/card-item';
import './materials.scss';
import useMaterials from './useMaterials';

export interface MaterialsProps {
    step: number;
    stepInfo: string;
}

const avgLabel = (value: string) => <div className="material-price">Avg price ${value}</div>;

const minMaxLabel = (min: string, max: string) => (
    <div className="material-price">
        ${min} - ${max} {UNIT_MEASURE.MATERIALS}
    </div>
);

export function Materials(props: MaterialsProps) {
    const { t } = useTranslation();
    const { stepInfo, step } = props;
    const {
        selectedStore,
        zipcode,
        materials,
        loading,
        selectedMaterial,
        updateSelectedMaterialByUser,
        updateSelectedDefaultColor,
        avgPriceMode,
    } = useMaterials();

    const selectManualMaterial = (material: MaterialModel) => {
        updateSelectedMaterialByUser(material);
        updateSelectedDefaultColor(undefined);
    };

    if (selectedStore || !zipcode) {
        return (
            <CardItem
                id={step}
                infoIcon={{
                    title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                    content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
                }}
                title={t('SCROLLABLE_AREA.MATERIAL.TITLE')}
                stepInfo={stepInfo}
                description={t('SCROLLABLE_AREA.MATERIAL.DESCRIPTION')}
            >
                <div>
                    {materials && !loading && (
                        <div className="material-card-content">
                            {materials.map((material: MaterialModel, id: number) => (
                                <div key={id} className="image-container">
                                    <div
                                        key={id}
                                        className={`image-card ${
                                            selectedMaterial?.qteGrpID === material.qteGrpID ? 'selected' : ''
                                        }`}
                                        onClick={() => selectManualMaterial(material)}
                                    >
                                        <img alt="material" src={material.imageUrl} />
                                        <div className="card-name">
                                            <div className="material-type">{material.description}</div>
                                            {avgPriceMode != PriceMode.NONE &&
                                                zipcode &&
                                                (avgPriceMode == PriceMode.AVG
                                                    ? avgLabel(material.avgPrice)
                                                    : minMaxLabel(material.minPrice, material.maxPrice))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {loading && <Spin style={{ fontSize: 24 }} />}
                </div>
            </CardItem>
        );
    } else {
        return (
            <CardItem
                id={step}
                infoIcon={{
                    title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                    content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
                }}
                stepInfo={stepInfo}
                title={t('SCROLLABLE_AREA.MATERIAL.TITLE')}
                description={t('SCROLLABLE_AREA.MATERIAL.ENTER_ZIP_CODE')}
            />
        );
    }
}

export default Materials;
