import { Divider } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useThickness from './useThickness';
import { PredefinedThicknessOption } from '@common/models/predefined-thickness-option.model';
import './thickness-options.scss';

export function ThicknessOptions() {
    const { t } = useTranslation();

    const { thicknessOptions, selectedThicknessOption, updateSelectedThicknessByUser } = useThickness();

    const ThicknessItem = (props: { thicknessOption: PredefinedThicknessOption }) => {
        const { thicknessOption } = props;

        return (
            <div
                className={`image-container ${
                    thicknessOption.id === selectedThicknessOption.thickness?.id ? 'selected' : ''
                }`}
                onClick={() => updateSelectedThicknessByUser(thicknessOption)}
            >
                <div className="image-card">
                    <img alt="thickness option" src={thicknessOption.image} />
                    <div className="card-name">
                        <div className="thickness-option-name">{thicknessOption.title}</div>
                    </div>
                </div>
            </div>
        );
    };

    const ThicknessContent = () => {
        return (
            <div className="thickness-option-card-content">
                {thicknessOptions.map((option: PredefinedThicknessOption, index: number) => (
                    <ThicknessItem key={index} thicknessOption={option} />
                ))}
            </div>
        );
    };

    return (
        <>
            <Divider className="thickness-divider" />
            <span className="title">{t('SCROLLABLE_AREA.COLOR.THICKNESS_INFO')}</span>
            <ThicknessContent />
        </>
    );
}

export default ThicknessOptions;
