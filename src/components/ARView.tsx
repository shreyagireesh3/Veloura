import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Box, Camera, Info, X, MousePointer2, Clock, RefreshCw } from 'lucide-react';
import { behaviorTracker } from '../services/behaviorTracker';
import { Interaction } from '../types';

// A-Frame needs to be imported globally or via script tag
// We'll use a dynamic script injection for reliability in this environment
export default function ARView() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Interaction | null>(null);

  useEffect(() => {
    // Check if A-Frame is already loaded
    if ((window as any).AFRAME) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Failed to load AR environment. Please check your connection.');
    document.head.appendChild(script);

    setInteractions(behaviorTracker.getInteractions());

    return () => {
      // Cleanup if needed
    };
  }, []);

  if (error) {
    return (
      <div className="h-[600px] flex items-center justify-center glass rounded-3xl">
        <div className="text-center p-8">
          <X className="mx-auto mb-4 text-red-500" size={32} />
          <p className="text-gray-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[600px] flex items-center justify-center glass rounded-3xl">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-veloura-accent" size={32} />
          <p className="text-gray-500">Initializing AR Environment...</p>
        </div>
      </div>
    );
  }

  // Filter for problematic interactions to visualize
  const frictionPoints = interactions.filter(i => ['rage_click', 'hesitation'].includes(i.type));

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold text-veloura-ink">Interactive UX Friction Map</h2>
        <p className="text-gray-500">Click hotspots to understand user struggles.</p>
      </div>

      <div className="relative h-[700px] rounded-3xl overflow-hidden glass border border-white/20">
        {/* AR Overlay UI */}
        <div className="absolute top-6 left-6 z-10 space-y-4 pointer-events-none">
          <div className="glass p-4 rounded-2xl pointer-events-auto">
            <h3 className="text-lg font-serif font-bold flex items-center gap-2">
              <Box size={18} className="text-veloura-accent" />
              Spatial Friction Map
            </h3>
            <p className="text-xs text-gray-500">Visualizing interaction density in 3D space.</p>
          </div>
          
          <div className="flex gap-2 pointer-events-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-[10px] font-bold uppercase">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Rage Clicks
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-[10px] font-bold uppercase">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              Hesitation
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 z-10 glass p-4 rounded-2xl max-w-xs pointer-events-auto">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-veloura-accent mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed text-gray-600">
              This view maps 2D interaction coordinates onto a 3D plane. 
              <strong> Red orbs</strong> indicate high-frequency clicks (rage). 
              <strong> Purple orbs</strong> indicate prolonged hovers (hesitation).
            </p>
          </div>
        </div>

        {/* Interaction Details List */}
        <div className="absolute top-6 right-6 z-10 max-w-[200px] w-full pointer-events-none">
          <div className="glass p-4 rounded-2xl pointer-events-auto">
            <h4 className="text-[10px] font-bold mb-3 flex items-center gap-2 uppercase tracking-wider text-gray-400">
              Recent Points
            </h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {frictionPoints.length === 0 ? (
                <p className="text-[10px] text-gray-400 italic">None detected.</p>
              ) : (
                frictionPoints.slice(-5).reverse().map((point) => (
                  <div 
                    key={point.id}
                    className="p-2 rounded-lg bg-white/50 border border-white/50 hover:bg-white transition-all cursor-pointer"
                    onClick={() => setSelectedPoint(point)}
                  >
                    <p className="text-[10px] font-bold truncate">{point.elementName}</p>
                    <p className={`text-[8px] font-bold uppercase ${point.type === 'rage_click' ? 'text-red-500' : 'text-purple-500'}`}>
                      {point.type.replace('_', ' ')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedPoint && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
            >
              <div className="glass p-8 rounded-[40px] border border-white/40 shadow-2xl max-w-sm w-full pointer-events-auto relative">
                <button 
                  onClick={() => setSelectedPoint(null)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-all text-gray-400"
                >
                  <X size={20} />
                </button>
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                  selectedPoint.type === 'rage_click' ? 'bg-red-100 text-red-500' : 'bg-purple-100 text-purple-500'
                }`}>
                  {selectedPoint.type === 'rage_click' ? <MousePointer2 size={24} /> : <Clock size={24} />}
                </div>
                
                <h3 className="text-xl font-serif font-bold text-veloura-ink mb-1">
                  {selectedPoint.type === 'rage_click' ? 'Rage Click Hotspot' : 'Hesitation Hotspot'}
                </h3>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${
                  selectedPoint.type === 'rage_click' ? 'text-red-500' : 'text-purple-500'
                }`}>
                  {selectedPoint.type.replace('_', ' ')} Detected
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-3 bg-white/40 rounded-xl border border-white/60">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Section</span>
                    <span className="text-xs font-semibold text-veloura-ink">{selectedPoint.elementName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white/40 rounded-xl border border-white/60">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {selectedPoint.type === 'rage_click' ? 'Repeated Clicks' : 'Hover Time'}
                    </span>
                    <span className="text-xs font-semibold text-veloura-ink">
                      {selectedPoint.type === 'rage_click' 
                        ? `${selectedPoint.count || 4}` 
                        : `${((selectedPoint.duration || 5200) / 1000).toFixed(1)} sec`}
                    </span>
                  </div>

                  <div className="p-3 bg-white/40 rounded-xl border border-white/60">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Likely Cause</p>
                    <p className="text-xs text-gray-600 italic">
                      {selectedPoint.type === 'rage_click' 
                        ? "User frustration / unclear action"
                        : "Unclear product details / decision fatigue"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">Coordinates</p>
                    <p className="text-veloura-ink font-mono text-[10px]">X: {Math.round(selectedPoint.x)}, Y: {Math.round(selectedPoint.y)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase mb-0.5">Timestamp</p>
                    <p className="text-veloura-ink font-mono text-[10px]">{new Date(selectedPoint.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* A-Frame Scene */}
        {/* @ts-ignore */}
        <a-scene embedded cursor="rayOrigin: mouse" raycaster="objects: .hotspot" style={{ width: '100%', height: '100%' }}>
          {/* @ts-ignore */}
          <a-sky color="#fdf2f8"></a-sky>
          
          {/* Ground / Product Plane */}
          {/* @ts-ignore */}
          <a-plane position="0 0 -4" rotation="-90 0 0" width="8" height="10" color="#ffffff" opacity="0.8" shadow></a-plane>
          
          {/* Stylized Product Page Layout in 3D */}
          {/* Image Area */}
          {/* @ts-ignore */}
          <a-box position="-1.5 0.1 -5" width="3" height="0.1" depth="4" color="#fbcfe8"></a-box>
          {/* Info Area */}
          {/* @ts-ignore */}
          <a-box position="2 0.1 -5" width="3" height="0.1" depth="4" color="#f3e8ff"></a-box>
          
          {/* Interaction Points */}
          {frictionPoints.map((point, idx) => {
            // Map 2D coordinates to 3D space
            // Assuming product page is roughly 1200x1600
            // Mapping to A-Frame plane 8x10
            const x3d = (point.x / 1200) * 8 - 4;
            const z3d = (point.y / 1600) * 10 - 5 - 4; // -4 is the plane offset
            
            const color = point.type === 'rage_click' ? '#ef4444' : '#8b5cf6';
            const size = point.type === 'rage_click' ? 0.3 : 0.2;
            
            return (
              /* @ts-ignore */
              <a-entity 
                key={point.id} 
                position={`${x3d} 0.5 ${z3d}`}
                class="hotspot"
                onClick={() => setSelectedPoint(point)}
              >
                {/* @ts-ignore */}
                <a-sphere 
                  radius={size} 
                  color={color} 
                  class="hotspot"
                  animation={`property: scale; to: 1.2 1.2 1.2; dir: alternate; dur: 1000; loop: true; easing: easeInOutSine`}
                ></a-sphere>
                {/* Pulsing ring */}
                {/* @ts-ignore */}
                <a-ring
                  radius-inner={size + 0.05}
                  radius-outer={size + 0.1}
                  color={color}
                  rotation="-90 0 0"
                  animation="property: scale; to: 2 2 2; dur: 2000; loop: true; easing: easeOutQuad"
                  animation__opacity="property: material.opacity; from: 0.8; to: 0; dur: 2000; loop: true; easing: easeOutQuad"
                ></a-ring>
                {/* @ts-ignore */}
                <a-light type="point" color={color} intensity="0.5" distance="2"></a-light>
              </a-entity>
            );
          })}

          {/* Lights & Camera */}
          {/* @ts-ignore */}
          <a-entity light="type: ambient; color: #BBB"></a-entity>
          {/* @ts-ignore */}
          <a-entity light="type: directional; color: #FFF; intensity: 0.6" position="-0.5 1 1"></a-entity>
          {/* @ts-ignore */}
          <a-entity camera look-controls wasd-controls position="0 5 2" rotation="-45 0 0"></a-entity>
        </a-scene>
      </div>
    </div>
  );
}
