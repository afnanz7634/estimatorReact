import { render } from '@testing-library/react';
import React from 'react';
import { PriceAreaDefaultInfo } from './price-area-default-info';

describe('PriceAreaDefaultInfo', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<PriceAreaDefaultInfo />);
        expect(baseElement).toBeTruthy();
    });
});
