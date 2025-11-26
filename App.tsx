import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Strategies from './pages/Strategies';

const AccountPage = () => (
  <div className="p-4 text-center text-gray-500">
    <h2 className="text-xl text-white mb-2">账户详情</h2>
    <p>此处展示更详细的账户历史流水、资金费用记录等。</p>
  </div>
);

const SettingsPage = () => (
  <div className="p-4 text-center text-gray-500">
    <h2 className="text-xl text-white mb-2">系统设置</h2>
    <p>此处配置币安 API Key (Key/Secret)，通知设置等。</p>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
