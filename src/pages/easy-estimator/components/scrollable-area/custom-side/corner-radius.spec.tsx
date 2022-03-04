import { render } from '@testing-library/react';
import React from 'react';
import { CustomSide } from './custom-side';

describe('Custom Sides', () => {
    // TODO;
    it('should render successfully', () => {
        const { baseElement } = render(<CustomSide stepInfo=" Step 7 of 7" step={7}/>);
        expect(baseElement).toBeTruthy();
    });
});
