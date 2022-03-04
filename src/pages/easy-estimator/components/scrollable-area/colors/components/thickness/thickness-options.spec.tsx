import { render } from '@testing-library/react';
import React from 'react';
import ThicknessOptions from "./thickness-options";

describe('Thickness Options', () => {
    // TODO;
    it('should render successfully', () => {
        const { baseElement } = render(<ThicknessOptions />);
        expect(baseElement).toBeTruthy();
    });
});
