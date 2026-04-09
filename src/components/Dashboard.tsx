import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  AlertCircle, 
  Lightbulb, 
  TrendingUp, 
  MousePointer2, 
  Clock, 
  Zap,
  RefreshCw,
  Box,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { behaviorTracker } from '../services/behaviorTracker';
import { generateUXInsights } from '../services/geminiService';
import { Interaction, UXInsight, BehaviorStats } from '../types';

interface DashboardProps {
  appliedFixes: Record<string, boolean>;
  onToggleFix: (elementId: string) => void;
}

export default function Dashboard({ appliedFixes, onToggleFix }: DashboardProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [insights, setInsights] = useState<UXInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stats, setStats] = useState<BehaviorStats>({
    rageClicks: 0,
    hesitations: 0,
    scrollStalls: 0,
    totalInteractions: 0,
    confusionScore: 0,
    smartMessagesShown: 0,
    smartMessagesEngaged: 0
  });

  useEffect(() => {
    const data = behaviorTracker.getInteractions();
    setInteractions(data);
    calculateStats(data);
  }, []);

  const calculateStats = (data: Interaction[]) => {
    const rageClicks = data.filter(i => i.type === 'rage_click').length;
    const hesitations = data.filter(i => i.type === 'hesitation').length;
    const smartMessagesShown = data.filter(i => i.type === 'smart_message_shown').length;
    const smartMessagesClicked = data.filter(i => i.type === 'smart_message_clicked').length;
    const total = data.length;
    
    // Weighted Confusion Score logic
    const frictionPoints = (rageClicks * 10) + (hesitations * 4);
    const score = total > 0 ? Math.min(Math.round((frictionPoints / (total * 2)) * 100), 100) : 0;

    setStats({ 
      rageClicks, 
      hesitations, 
      scrollStalls: 0, 
      totalInteractions: total,
      confusionScore: score,
      smartMessagesShown,
      smartMessagesEngaged: smartMessagesClicked
    });
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const newInsights = await generateUXInsights(interactions);
      setInsights(newInsights);
    } catch (error) {
      console.error('Analysis failed', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const engagementRate = stats.smartMessagesShown > 0 
    ? Math.round((stats.smartMessagesEngaged / stats.smartMessagesShown) * 100) 
    : 0;

  const chartData = [
    { name: 'Rage Clicks', value: stats.rageClicks, color: '#db2777' },
    { name: 'Hesitations', value: stats.hesitations, color: '#7c3aed' },
    { name: 'Smart Prompts', value: stats.smartMessagesShown, color: '#3b82f6' },
    { name: 'Normal', value: stats.totalInteractions - stats.rageClicks - stats.hesitations - stats.smartMessagesShown, color: '#10b981' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2">UX Intelligence</h1>
          <p className="text-gray-500">Real-time behavioral analysis of your interface.</p>
        </div>
        <button 
          onClick={runAnalysis}
          disabled={isAnalyzing || interactions.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-veloura-ink text-white rounded-2xl hover:bg-slate-900 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
          {isAnalyzing ? 'Analyzing...' : 'Generate AI Insights'}
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard 
          icon={<MousePointer2 className="text-pink-500" />} 
          label="Rage Clicks" 
          value={stats.rageClicks} 
          trend="+12%" 
        />
        <StatCard 
          icon={<Clock className="text-purple-500" />} 
          label="Hesitations" 
          value={stats.hesitations} 
          trend="-5%" 
        />
        <StatCard 
          icon={<Sparkles className="text-blue-500" />} 
          label="Smart Prompts" 
          value={stats.smartMessagesShown} 
          trend={`${engagementRate}% Eng.`}
        />
        <StatCard 
          icon={<TrendingUp className="text-emerald-500" />} 
          label="Total Events" 
          value={stats.totalInteractions} 
          trend="+24%" 
        />
        <StatCard 
          icon={<AlertCircle className="text-pink-500" />} 
          label="Confusion Score" 
          value={stats.confusionScore} 
          unit="%"
          trend={stats.confusionScore > 40 ? 'High' : 'Healthy'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 glass rounded-3xl p-8">
          <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-veloura-accent" />
            Interaction Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="glass rounded-3xl p-8 overflow-hidden flex flex-col">
          <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
            <Lightbulb size={20} className="text-amber-500" />
            AI Recommendations
          </h3>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {insights.length > 0 ? (
                insights.map((insight, idx) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-2xl bg-white/50 border border-white/50 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-veloura-ink">{insight.issue}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                        insight.severity === 'high' ? 'bg-red-100 text-red-600' :
                        insight.severity === 'medium' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {insight.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
                    <div className="pt-2 border-t border-gray-100 mt-2 flex flex-col gap-3">
                      <div>
                        <p className="text-[10px] font-bold text-veloura-accent uppercase tracking-wider mb-1">Suggested Fix</p>
                        <p className="text-xs font-medium italic">"{insight.suggestion}"</p>
                      </div>
                      
                      <button 
                        onClick={() => onToggleFix(insight.elementId)}
                        className={`w-full py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all ${
                          appliedFixes[insight.elementId]
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                            : 'bg-veloura-ink text-white hover:bg-slate-900'
                        }`}
                      >
                        {appliedFixes[insight.elementId] ? (
                          <>
                            <CheckCircle2 size={12} />
                            Fix Applied
                          </>
                        ) : (
                          <>
                            <Zap size={12} />
                            Apply Smart Fix
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                  <Box size={48} className="mb-4 text-gray-300" />
                  <p className="text-sm">No insights generated yet. Interact with the product page first.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, unit = '' }: { icon: React.ReactNode, label: string, value: number, trend?: string, unit?: string }) {
  return (
    <div className="glass rounded-3xl p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-white/50">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}{unit}</p>
      </div>
    </div>
  );
}
