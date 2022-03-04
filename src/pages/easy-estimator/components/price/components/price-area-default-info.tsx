import { ColorModel } from '@common/models';
import { Image } from 'antd';
import { useTranslation } from 'react-i18next';
import './price-area-default-info.scss';

export interface PriceAreaDefaultInfoProps {
    selectedColor?: ColorModel;
}

export function PriceAreaDefaultInfo(props: PriceAreaDefaultInfoProps) {
    const { t } = useTranslation();
    const { selectedColor } = props;

    const PriceAreaDefaultText = () => {
        return (
            <div className={!selectedColor ? 'default-text-descriptor' : 'text-descriptor'}>
                {t('PRICING_AREA.DEFAULT_DESCRIPTION')}
            </div>
        );
    };

    const SelectedColorDescription = () => {
        return (
            <div>
                {selectedColor && (
                    <div className={'default-image-text-container'}>
                        <Image
                            className="image"
                            preview={false}
                            width={240}
                            height={156}
                            src={
                                selectedColor.beautyShotImageUrl
                                    ? selectedColor.beautyShotImageUrl
                                    : selectedColor.swatchImageUrl
                            }
                        />

                        <PriceAreaDefaultText></PriceAreaDefaultText>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="default-container">
            {!selectedColor ? (
                <PriceAreaDefaultText></PriceAreaDefaultText>
            ) : (
                <SelectedColorDescription></SelectedColorDescription>
            )}
        </div>
    );
}
