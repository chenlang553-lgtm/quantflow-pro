import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Wallet,
  Activity
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: '概览监控', to: '/' },
    { icon: <Bot size={20} />, label: '策略管理', to: '/strategies' },
    { icon: <Wallet size={20} />, label: '账户资产', to: '/account' },
    { icon: <Settings size={20} />, label: '系统设置', to: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-850 border-r border-gray-750 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-750">
          <div className="flex items-center space-x-2 text-primary-500 font-bold text-xl">
            <Activity />
            <span>QuantFlow</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-750">
          <button className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors w-full">
            <LogOut size={20} />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-gray-850 border-b border-gray-750 flex items-center justify-between px-6 lg:px-8">
          <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center ml-auto space-x-4">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-white">Admin User</div>
              <div className="text-xs text-gray-400">UID: 8829103</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-500 to-purple-600 flex items-center justify-center font-bold text-white">
              AU
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
