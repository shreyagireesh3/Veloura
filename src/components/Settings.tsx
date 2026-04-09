import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Trash2, 
  Save, 
  MousePointer2, 
  Clock, 
  Eye, 
  Map as MapIcon,
  RotateCcw,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { behaviorTracker } from '../services/behaviorTracker';
import { AppSettings } from '../types';

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(behaviorTracker.getSettings());
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSave = () => {
    behaviorTracker.updateSettings(settings);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleReset = () => {
    const defaults: AppSettings = {
      rageClickThreshold: 3,
      rageClickWindow: 1000,
      hesitationThreshold: 3000,
      showLiveLabels: true,
      showHeatmapByDefault: false,
      enableSmartMessaging: true
    };
    setSettings(defaults);
    behaviorTracker.updateSettings(defaults);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all interaction data? This cannot be undone.')) {
      behaviorTracker.clear();
      alert('Data cleared successfully.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif font-bold mb-2">Settings</h2>
          <p className="text-gray-500">Configure Veloura's detection engine and UI preferences.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-veloura-ink transition-all"
          >
            <RotateCcw size={18} />
            Reset Defaults
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-veloura-ink text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100"
          >
            <Save size={18} />
            Save Settings
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Detection Engine */}
        <div className="glass p-8 rounded-3xl border border-white/20 space-y-6">
          <h3 className="text-xl font-serif font-bold flex items-center gap-2">
            <SettingsIcon className="text-veloura-accent" size={20} />
            Detection Engine
          </h3>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MousePointer2 size={16} className="text-pink-500" />
                Rage Click Threshold
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="2" 
                  max="10" 
                  value={settings.rageClickThreshold}
                  onChange={(e) => setSettings({...settings, rageClickThreshold: parseInt(e.target.value)})}
                  className="flex-1 accent-veloura-accent"
                />
                <span className="w-12 text-center font-bold bg-white rounded-lg py-1 border border-gray-100">
                  {settings.rageClickThreshold}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Number of clicks required to trigger a rage event.</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="text-purple-500" />
                Hesitation Threshold (ms)
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  step="500"
                  min="1000"
                  max="10000"
                  value={settings.hesitationThreshold}
                  onChange={(e) => setSettings({...settings, hesitationThreshold: parseInt(e.target.value)})}
                  className="flex-1 bg-white/50 border border-white/20 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 ring-veloura-accent/20"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Minimum hover duration to be flagged as hesitation.</p>
            </div>
          </div>
        </div>

        {/* UI Preferences */}
        <div className="glass p-8 rounded-3xl border border-white/20 space-y-6">
          <h3 className="text-xl font-serif font-bold flex items-center gap-2">
            <Eye className="text-blue-500" size={20} />
            UI Preferences
          </h3>

          <div className="space-y-6">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-500 group-hover:scale-110 transition-transform">
                  <Eye size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">Show Live Labels</p>
                  <p className="text-[10px] text-gray-400">Display "Hesitation detected" labels in real-time.</p>
                </div>
              </div>
              <div 
                onClick={() => setSettings({...settings, showLiveLabels: !settings.showLiveLabels})}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.showLiveLabels ? 'bg-veloura-accent' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.showLiveLabels ? 'left-7' : 'left-1'}`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500 group-hover:scale-110 transition-transform">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">Smart Messaging</p>
                  <p className="text-[10px] text-gray-400">Proactively assist users during friction events.</p>
                </div>
              </div>
              <div 
                onClick={() => setSettings({...settings, enableSmartMessaging: !settings.enableSmartMessaging})}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.enableSmartMessaging ? 'bg-veloura-accent' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.enableSmartMessaging ? 'left-7' : 'left-1'}`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-50 text-pink-500 group-hover:scale-110 transition-transform">
                  <MapIcon size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">Heatmap by Default</p>
                  <p className="text-[10px] text-gray-400">Always show the heatmap overlay on product pages.</p>
                </div>
              </div>
              <div 
                onClick={() => setSettings({...settings, showHeatmapByDefault: !settings.showHeatmapByDefault})}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.showHeatmapByDefault ? 'bg-veloura-accent' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.showHeatmapByDefault ? 'left-7' : 'left-1'}`} />
              </div>
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass p-8 rounded-3xl border border-red-100 bg-red-50/10 space-y-6 md:col-span-2">
          <h3 className="text-xl font-serif font-bold flex items-center gap-2 text-red-600">
            <Trash2 size={20} />
            Danger Zone
          </h3>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-white/50 border border-red-100">
            <div>
              <p className="font-bold text-red-600">Clear Interaction History</p>
              <p className="text-xs text-gray-500">Permanently delete all captured clicks, hovers, and friction points.</p>
            </div>
            <button 
              onClick={handleClearData}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100 whitespace-nowrap"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold shadow-2xl border-emerald-100 z-50"
          >
            <CheckCircle2 size={20} />
            Settings saved successfully
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
