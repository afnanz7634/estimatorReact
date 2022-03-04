import { Modal } from 'antd';
import { ReactElement } from 'react';
import './modal.scss';
import { useTranslation } from 'react-i18next';

export interface ModalProps {
    title: string;
    isVisible: boolean;
    onClose: (value: boolean) => void;
    container: string;
    content?: ReactElement;
}

export function ConfigurableModal(props: ModalProps) {
    const { t } = useTranslation();

    const handleCancel = () => {
        props.onClose(false);
    };

    return (
        <Modal
            className="custom-modal"
            getContainer={props.container}
            visible={props.isVisible}
            onCancel={handleCancel}
            width="auto"
            centered={true}
            footer={null}
        >
            <div className="modal-title">{t(`${props.title}`)}</div>
            <div className="modal-content">{props.content}</div>
        </Modal>
    );
}

export default ConfigurableModal;
