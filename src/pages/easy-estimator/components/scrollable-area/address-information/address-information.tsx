import { CardItem } from '@core/components';
import { useTranslation } from 'react-i18next';
import useAddress from './useAddress';
import { ZipCodeStores } from './zip-code-stores/zip-code-stores';

export interface AddressInformationProps {
    step: number;
    stepInfo: string;
}

export function AddressInformation(props: AddressInformationProps) {
    const { t } = useTranslation();
    const { stepInfo, step } = props;
    const { loading, fetchStores } = useAddress();

    const onSubmit = (code: string) => {
        fetchStores(code);
    };

    return (
        <CardItem
            title={t('SCROLLABLE_AREA.ADDRESS_INFORMATION.INFORMATION')}
            id={step}
            stepInfo={stepInfo}
            description={t('SCROLLABLE_AREA.ADDRESS_INFORMATION.DESCRIPTION')}
            infoIcon={{
                title: t('SCROLLABLE_AREA.CARD_MODAL.TITLE'),
                content: t('SCROLLABLE_AREA.CARD_MODAL.CONTENT'),
            }}
        >
            <ZipCodeStores loading={loading} onSubmit={onSubmit} />
        </CardItem>
    );
}
