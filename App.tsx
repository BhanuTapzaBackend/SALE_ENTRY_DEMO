import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  ChevronDown, 
  Search, 
  Bell, 
  Menu,
  Stethoscope,
  Pill,
  Truck,
  RotateCcw
} from 'lucide-react';
import SalesRetail from './components/SalesRetail';
import PurchaseEntry from './components/PurchaseEntry';

const SidebarItem = ({ icon: Icon, label, active = false, hasSubmenu = false, count, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${active ? 'bg-blue-800 text-white border-l-4 border-blue-400' : 'text-blue-100 hover:bg-blue-800/50'}`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {count && <span className="bg-blue-600 text-xs px-2 py-0.5 rounded-full">{count}</span>}
      {hasSubmenu && <ChevronDown size={14} />}
    </div>
  </div>
);

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'sales' | 'purchase'>('sales');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-[#1a237e] flex-shrink-0 transition-all duration-300 flex flex-col z-20`}>
        <div className="h-16 flex items-center px-4 bg-[#151b60]">
          <div className="flex items-center gap-2 font-bold text-white text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">T</div>
            {sidebarOpen && <span>TAPZA</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <div className="px-4 mb-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            {sidebarOpen && 'Main'}
          </div>
          <SidebarItem icon={LayoutDashboard} label={sidebarOpen ? "Dashboard" : ""} />
          
          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            {sidebarOpen && 'Inventory & Sales'}
          </div>
          <SidebarItem 
            icon={ShoppingCart} 
            label={sidebarOpen ? "Sales Retail" : ""} 
            active={activeView === 'sales'} 
            hasSubmenu 
            onClick={() => setActiveView('sales')}
          />
          <SidebarItem 
             icon={Package} 
             label={sidebarOpen ? "Purchase Entry" : ""} 
             active={activeView === 'purchase'}
             onClick={() => setActiveView('purchase')}
          />

            {sidebarOpen && activeView === 'sales' && (
              <div className="bg-[#151b60]/50 mb-2">
                <div className="pl-12 py-2 text-sm text-blue-200 hover:text-white cursor-pointer">Wholesale</div>
                <div className="pl-12 py-2 text-sm text-blue-200 hover:text-white cursor-pointer">Sales Returns</div>
                <div className="pl-12 py-2 text-sm text-blue-200 hover:text-white cursor-pointer flex justify-between pr-4">
                  Sales Drafts <span className="bg-orange-500 text-white text-[10px] px-1.5 rounded">12</span>
                </div>
              </div>
            )}
          
          <SidebarItem icon={Truck} label={sidebarOpen ? "Delivery Challan" : ""} />
          <SidebarItem icon={RotateCcw} label={sidebarOpen ? "Contra" : ""} />
          
          <div className="px-4 mt-6 mb-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            {sidebarOpen && 'Management'}
          </div>
          <SidebarItem icon={Stethoscope} label={sidebarOpen ? "Doctor Master" : ""} />
          <SidebarItem icon={Pill} label={sidebarOpen ? "Item Master" : ""} />
          <SidebarItem icon={FileText} label={sidebarOpen ? "Reports" : ""} hasSubmenu />
          <SidebarItem icon={Settings} label={sidebarOpen ? "Settings" : ""} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
              <Menu size={20} />
            </button>
            <div className="flex items-center text-sm text-gray-500">
              <span className="hover:text-blue-600 cursor-pointer">Medical Sales</span>
              <span className="mx-2">/</span>
              <span className="font-semibold text-gray-800">
                {activeView === 'sales' ? 'Sales Retail' : 'Purchase Entry'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Global Search (Ctrl + /)" 
                className="pl-9 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 text-blue-800 font-bold">
                 <div className="w-5 h-5 bg-blue-800 rounded-sm transform rotate-45 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full transform -rotate-45"></div>
                 </div>
                 ATLASSIAN
               </div>
               <div className="relative cursor-pointer">
                 <Bell size={20} className="text-gray-600" />
                 <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
               </div>
               <img src="https://picsum.photos/40/40" alt="Profile" className="w-9 h-9 rounded-full border border-gray-200" />
            </div>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 overflow-hidden relative">
          {activeView === 'sales' ? <SalesRetail /> : <PurchaseEntry />}
        </main>
      </div>
    </div>
  );
};

export default App;