import 'antd/dist/antd.less';
import React, { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import './App.scss';
import i18n from './core/i18n/i18n';
import EasyEstimatorPage from './pages/easy-estimator/easy-estimator-page';
import { ContextProvider } from './pages/easy-estimator/context';

const App: React.FC<{}> = () => {
    return (
        <Suspense fallback="loading">
            <I18nextProvider i18n={i18n}>
                <div className="app">
                    <ContextProvider>
                        <EasyEstimatorPage />
                    </ContextProvider>
                </div>
            </I18nextProvider>
        </Suspense>
    );
};

export default App;
