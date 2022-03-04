import { StopOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import './notifier-item.scss';

export interface NotifierItemProps extends DescriptionElementProps {
    title: string;
    icon: React.ReactNode;
    className: string;
}

export interface DescriptionElementProps {
    generalDescription: string;
    extraInfo?: string;
}

const DescriptionElement = (props: DescriptionElementProps) => {
    const { generalDescription, extraInfo } = props;
    return (
        <div className="description-container">
            <div style={{ marginBottom: '3px' }}>{generalDescription}</div>
            {extraInfo && <div>{extraInfo}</div>}
        </div>
    );
};

export const showErrorNotification = (title: string, description: string, extraInfo?: string) => {
    const notifierItemProps: NotifierItemProps = {
        title: title,
        generalDescription: description,
        extraInfo: extraInfo ? extraInfo : undefined,
        className: 'error-container',
        icon: <StopOutlined />,
    };

    openNotifierItem(notifierItemProps);
};

export const showWarningNotification = (title: string, description: string, extraInfo?: string) => {
    const notifierItemProps: NotifierItemProps = {
        title: title,
        generalDescription: description,
        extraInfo: extraInfo ? extraInfo : undefined,
        className: 'warning-container',
        icon: <StopOutlined />,
    };

    openNotifierItem(notifierItemProps);
};

export const showSuccessNotification = (title: string, description: string, extraInfo?: string) => {
    const notifierItemProps: NotifierItemProps = {
        title: title,
        generalDescription: description,
        extraInfo: extraInfo ? extraInfo : undefined,
        className: 'success-container',
        icon: <StopOutlined />,
    };

    openNotifierItem(notifierItemProps);
};
const openNotifierItem = (props: NotifierItemProps) => {
    const { title, generalDescription, extraInfo, icon, className } = props;

    notification.open({
        message: title,
        description: <DescriptionElement generalDescription={generalDescription} extraInfo={extraInfo} />,
        icon: icon,
        style: {
            height: 150,
            width: 550,
            padding: '10px',
            borderRadius: '5px',
        },
        className: className,
        duration: 7,
    });
};
