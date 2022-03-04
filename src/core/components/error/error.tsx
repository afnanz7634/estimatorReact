import React from 'react';
import './error.scss';
// TO DO: Change error message based on design
export interface ErrorProps {
    errorMessage: string;
    errorStyle: string;
}

export function Error(props: ErrorProps) {
    const { errorMessage, errorStyle } = props;
    return <div className={errorStyle}>{errorMessage}</div>;
}
export default Error;
