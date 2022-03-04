import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import Layout, { Content } from 'antd/lib/layout/layout';
import Sider from 'antd/lib/layout/Sider';
import React, { useEffect, useState } from 'react';
import Price from './components/price/price';
import ScrollableArea from './components/scrollable-area/scrollable-area';
import './easy-estimator-page.scss';
import useEstimator from './use-estimator';

export interface EasyEstimatorPageProps {}

export function EasyEstimatorPage(props: EasyEstimatorPageProps) {
    const [active, setActive] = useState('information');
    const [collapsed, setCollapsed] = useState(false);
    const { loading, fetchPredefinedShapes, fetchRetailerSettings } = useEstimator();

    useEffect(() => {
        fetchRetailerSettings();
        fetchPredefinedShapes();
    }, []);

    const onCollapse = (collapsed: boolean) => {
        setCollapsed(collapsed);
    };

    const CustomTrigger = () => (
        <div className="price-collapse">
            {!collapsed && <RightOutlined />}
            {collapsed && <LeftOutlined />}
        </div>
    );

    return (
        <>
            {!loading && (
                <Layout>
                    <Content className="site-layout">
                        {!loading && <ScrollableArea active={active}></ScrollableArea>}
                    </Content>

                    <Sider
                        className="price-area "
                        onCollapse={onCollapse}
                        theme="light"
                        width={300}
                        breakpoint="sm"
                        collapsedWidth={0}
                        collapsible
                        trigger={<CustomTrigger />}
                        reverseArrow={true}
                    >
                        <Price></Price>
                    </Sider>
                </Layout>
            )}
            {loading && (
                <Layout className="no-content">
                    <Spin style={{ fontSize: 34 }} />
                </Layout>
            )}
        </>
    );
}

export default EasyEstimatorPage;
