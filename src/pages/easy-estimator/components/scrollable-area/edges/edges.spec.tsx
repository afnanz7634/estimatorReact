import { render } from '@testing-library/react';
import React from 'react';
import { Edges } from './edges';

describe('Edges', () => {
    // TODO;
    it('should render successfully', () => {
        const { baseElement } = render(<Edges stepInfo="Step 5 of 5" step={5}/>);
        expect(baseElement).toBeTruthy();
    });
});
