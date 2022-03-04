import { render } from '@testing-library/react';
import React from 'react';
import { CornerRadius } from './corner-radius';

describe('Edges', () => {
    // TODO;
    it('should render successfully', () => {
        const { baseElement } = render(<CornerRadius stepInfo=" Step 6 of 6"  step={6}/>);
        expect(baseElement).toBeTruthy();
    });
});
