import { render } from '@testing-library/react';
import React from 'react';
import { DiagonalCorners } from './diagonal-corners';

describe('Diagonal Corners', () => {
    // TODO;
    it('should render successfully', () => {
        const { baseElement } = render(<DiagonalCorners stepInfo="Step 8 of 8" step={8}/>);
        expect(baseElement).toBeTruthy();
    });
});
