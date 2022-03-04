import { render } from '@testing-library/react';
import React from 'react';
import ScrollableArea from './scrollable-area';

describe('ScrollableArea', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<ScrollableArea />);
        expect(baseElement).toBeTruthy();
    });
});
