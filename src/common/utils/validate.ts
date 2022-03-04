import { RuleObject } from 'antd/lib/form';
import { TFunctionResult } from 'i18next';

export const numericValidator = (input: string): boolean => {
    const regularExpression = /^\d+$/;
    const result = regularExpression.test(input);
    return result;
};

export const preventNonNumericalInput = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    event = event || window.event;
    const charCode = typeof event.key === 'undefined' ? event.code : event.key;
    if (!charCode.match(/^[0-9]+$/)) event.preventDefault();
};

export const validateZipCode = (rule: RuleObject, value: string, callback: (value: string) => TFunctionResult) => {
    if (!value) {
        return Promise.reject(callback('VALIDATION_MESSAGE.ZIP_CODE_EMPTY'));
    }
    if (!numericValidator(value)) {
        return Promise.reject(callback('VALIDATION_MESSAGE.ZIP_CODE_NUMERIC_INPUT'));
    }
    if (value.length < 5) {
        return Promise.reject(callback('VALIDATION_MESSAGE.ZIP_CODE_LESS_5DIGITS'));
    }
    if (value.length > 5) {
        return Promise.reject(callback('VALIDATION_MESSAGE.ZIP_CODE_MORE_5DIGITS'));
    }
    return Promise.resolve('');
};
