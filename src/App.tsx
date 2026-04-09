import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Box, 
  Settings as SettingsIcon, 
  Bell, 
  Search,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import ProductPage from './components/ProductPage';
import ProductList from './components/ProductList';
import Dashboard from './components/Dashboard';
import ARView from './components/ARView';
import SettingsView from './components/Settings';
import { Product, PRODUCTS } from './types';

const VelouraLogo = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbcfe8" />
        <stop offset="50%" stopColor="#db2777" />
        <stop offset="100%" stopColor="#9d174d" />
      </linearGradient>
    </defs>
    {/* Handle */}
    <path d="M35 30C35 20 45 15 50 15C55 15 65 20 65 30" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
    
    {/* Bag Body with Profile Silhouette */}
    <path d="M35 80C35 80 30 78 28 75C25 70 28 65 30 62C32 59 25 58 23 54C21 50 25 45 28 42C31 39 30 35 35 30H75C80 30 85 35 85 40V70C85 75 80 80 75 80H35Z" fill="url(#logo-grad)" />
    
    {/* Profile Details (Eye/Nose/Lips) */}
    <circle cx="28" cy="48" r="0.5" fill="white" opacity="0.6" />
    <path d="M24 55C25 55 26 56 26 57" stroke="white" strokeWidth="0.5" opacity="0.4" />
    
    {/* Sparkles */}
    <path d="M55 45L57 50L62 52L57 54L55 59L53 54L48 52L53 50L55 45Z" fill="white" opacity="0.8" />
    <path d="M65 38L66 41L69 42L66 43L65 46L64 43L61 42L64 41L65 38Z" fill="white" opacity="0.6" />
    
    {/* Tag */}
    <rect x="70" y="45" width="12" height="18" rx="2" transform="rotate(15 70 45)" fill="#fbbf24" />
    <text x="73" y="60" fill="#92400e" fontSize="10" fontWeight="bold" transform="rotate(15 73 60)">₹</text>
  </svg>
);

type View = 'store' | 'product' | 'dashboard' | 'ar' | 'settings';

export default function App() {
  const [activeView, setActiveView] = useState<View>('store');
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [appliedFixes, setAppliedFixes] = useState<Record<string, boolean>>({});

  const toggleFix = (elementId: string) => {
    setAppliedFixes(prev => ({ ...prev, [elementId]: !prev[elementId] }));
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setActiveView('product');
  };

  const navItems = [
    { id: 'store', label: 'Store Demo', icon: ShoppingBag },
    { id: 'dashboard', label: 'Analytics', icon: LayoutDashboard },
    { id: 'ar', label: 'Spatial Map', icon: Box },
  ];

  return (
    <div className="min-h-screen flex pastel-gradient">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="glass border-r border-white/20 flex flex-col z-50 sticky top-0 h-screen"
      >
        <div className="p-6 flex flex-col gap-1 mb-8">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <VelouraLogo size={48} />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-script text-veloura-accent leading-none"
                >
                  Veloura
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[7px] font-bold tracking-[0.2em] text-gray-400 uppercase whitespace-nowrap"
                >
                  UX Intelligence Redefined
                </motion.span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                activeView === item.id 
                  ? 'bg-veloura-ink text-white shadow-lg shadow-indigo-100' 
                  : 'text-gray-500 hover:bg-white/50 hover:text-veloura-ink'
              }`}
            >
              <item.icon size={22} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              {activeView === item.id && isSidebarOpen && (
                <motion.div 
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-veloura-accent"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-2">
          <button 
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
              activeView === 'settings' 
                ? 'bg-veloura-ink text-white shadow-lg shadow-indigo-100' 
                : 'text-gray-500 hover:bg-white/50 hover:text-veloura-ink'
            }`}
          >
            <SettingsIcon size={22} />
            {isSidebarOpen && <span className="font-medium">Settings</span>}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-500 hover:bg-white/50 transition-all"
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            {isSidebarOpen && <span className="font-medium">Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 bg-white/10 backdrop-blur-sm z-40 border-b border-white/10">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search interactions..." 
                className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 ring-veloura-accent/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl bg-white/50 border border-white/20 text-gray-500 hover:text-veloura-ink transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-veloura-accent border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/20">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">Veloura Admin</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">UX Intelligence Dashboard</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-veloura-lavender border border-white overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeView === 'store' && <ProductList onProductClick={handleProductSelect} />}
              {activeView === 'product' && (
                <ProductPage 
                  product={selectedProduct} 
                  appliedFixes={appliedFixes} 
                  onBack={() => setActiveView('store')}
                />
              )}
              {activeView === 'dashboard' && <Dashboard appliedFixes={appliedFixes} onToggleFix={toggleFix} />}
              {activeView === 'ar' && <ARView />}
              {activeView === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(30, 27, 75, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(30, 27, 75, 0.2);
        }
      `}</style>
    </div>
  );
}
