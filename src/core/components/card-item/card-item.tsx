import { InfoCircleFilled, RightOutlined } from '@ant-design/icons';
import { Collapse, Spin } from 'antd';
import React, { ReactElement, useState } from 'react';
import './card-item.scss';
import ConfigurableModal from '@core/components/modal/modal';

export interface InfoIconProps {
    title: string;
    content?: ReactElement;
}

export interface CardItemProps {
    title: string;
    id: number;
    stepInfo?: string;
    description?: string;
    extra?: ReactElement;
    children?: ReactElement;
    disabled?: boolean;
    infoIcon?: InfoIconProps;
}

export function CardItem(props: CardItemProps) {
    const { title, id, stepInfo, description, extra: extra, children: children, disabled, infoIcon } = props;
    const { Panel } = Collapse;
    const [expanded, setExpanded] = useState(true);
    const [isModalDisplayed, setModalDisplayed] = useState(false);

    const CollapsableArrow = () => {
        return <>{!expanded || disabled ? <RightOutlined className="arrow" /> : <RightOutlined rotate={90} />}</>;
    };

    const StepInfo = () => {
        return <>{stepInfo ? <span> ({stepInfo}) </span> : <Spin className="loading-spinner" />}</>;
    };
    const Header = (
        <>
            <CollapsableArrow />
            <span className="title">
                {title} <StepInfo />
            </span>
        </>
    );

    const DisabledHeader = (
        <>
            <RightOutlined />
            <span className="title">
                {title} <StepInfo />
            </span>
        </>
    );

    const callback = () => {
        setExpanded(!expanded);
    };

    const handleInfoIconClick = () => {
        if (expanded && !disabled) {
            setModalDisplayed(true);
        }
    };

    const buildInfoIconClassName = () => {
        let className = 'info-icon';
        if (!expanded) {
            className += ' info-icon-disabled';
        }

        if (disabled) {
            className += ' info-icon-not-allowed';
        }
        return className;
    };

    const panelExtra = () => {
        return (
            <>
                {extra}
                {infoIcon && <InfoCircleFilled className={buildInfoIconClassName()} onClick={handleInfoIconClick} />}
            </>
        );
    };

    return (
        <>
            {disabled ? (
                <Collapse className="container-card-disabled" defaultActiveKey={['1']} destroyInactivePanel={true}>
                    <Panel
                        showArrow={false}
                        header={DisabledHeader}
                        extra={panelExtra()}
                        key="2"
                        forceRender={true}
                        collapsible="disabled"
                    />
                </Collapse>
            ) : (
                <>
                    <Collapse
                        className={`container-card modal-mount-${id}`}
                        defaultActiveKey={['1']}
                        onChange={callback}
                    >
                        <Panel
                            showArrow={false}
                            header={Header}
                            extra={panelExtra()}
                            key="1"
                            collapsible={'header'}
                            forceRender={true}
                        >
                            <div className="description">{description}</div>
                            {children}
                        </Panel>
                    </Collapse>
                    {infoIcon && (
                        <ConfigurableModal
                            title={infoIcon.title}
                            isVisible={isModalDisplayed}
                            onClose={setModalDisplayed}
                            container={`.modal-mount-${id}`}
                            content={infoIcon.content}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default CardItem;
