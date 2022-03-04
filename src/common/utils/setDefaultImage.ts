import { SyntheticEvent } from 'react';

export const defaultUrl = 'https://s3.amazonaws.com/hpro-countertops.assets.inscyth/hauspro/RU607H-thumbnail.jpg';

export const setDefaultSrc = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = defaultUrl;
};
