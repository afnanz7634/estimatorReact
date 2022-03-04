import { render } from '@testing-library/react';
import React from 'react';
import { TearOutCountertop } from './tear-out-countertop';

describe('Tear Out Countertop', () => {
    // TODO;
    it('should render successfully', () => {
        const { baseElement } = render(<TearOutCountertop stepInfo=" Step 7 of 7" step={7}/>);
        expect(baseElement).toBeTruthy();
    });
});
