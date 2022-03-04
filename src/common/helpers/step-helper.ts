import { useTranslation } from 'react-i18next';

export const cardStepsDictionary = {
    Information: 1,
    Material: 2,
    Color: 3,
    Design_Countertop: 4,
    Edge: 5,
    Corner_Radius: 6,
    Diagonal_Corner: 7,
    Custom_Side: 8,
    Tear_Out_Countertop: 9
};

export const getCardStep = (stepNumber: number): string => {
    const { t } = useTranslation();
    const totalSteps = Object.keys(cardStepsDictionary).length;

    return t('SCROLLABLE_AREA.STEPS_COUNTER', { stepNumber: stepNumber, totalSteps: totalSteps });
};
