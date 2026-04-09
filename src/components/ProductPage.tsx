import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Heart, Share2, Info, ChevronRight, Star, AlertCircle, Sparkles } from 'lucide-react';
import { behaviorTracker } from '../services/behaviorTracker';
import { Interaction, Product } from '../types';
import SmartMessage from './SmartMessage';

interface ProductPageProps {
  product: Product;
  appliedFixes?: Record<string, boolean>;
  onBack?: () => void;
}

interface ActiveSmartMessage {
  id: string;
  elementId: string;
  message: string;
  actionLabel: string;
  action: () => void;
}

export default function ProductPage({ product, appliedFixes = {}, onBack }: ProductPageProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [detections, setDetections] = useState<{ type: string; elementId: string; id: string }[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(behaviorTracker.getSettings().showHeatmapByDefault);
  const [activeSmartMessage, setActiveSmartMessage] = useState<ActiveSmartMessage | null>(null);
  
  const sizeGuideRef = useRef<HTMLButtonElement>(null);
  const shippingAccordionRef = useRef<HTMLDivElement>(null);
  const detailsAccordionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    behaviorTracker.setOnDetection((type, elementId) => {
      const id = Math.random().toString(36).substr(2, 9);
      setDetections(prev => [...prev, { type, elementId, id }]);
      
      // Smart Message Triggers
      if (type === 'rage_click' && elementId.startsWith('size-')) {
        triggerSmartMessage(
          'size-help',
          'size-guide',
          "Need help choosing the perfect size? Our guide is here to help.",
          "View Size Guide",
          () => sizeGuideRef.current?.scrollIntoView({ behavior: 'smooth' })
        );
      }

      if (type === 'hesitation' && elementId === 'shipping-accordion') {
        triggerSmartMessage(
          'return-policy',
          'shipping-accordion',
          "Free returns within 7 days. Shop with complete peace of mind.",
          "See Return Policy",
          () => shippingAccordionRef.current?.scrollIntoView({ behavior: 'smooth' })
        );
      }

      if (type === 'hesitation' && elementId === 'add-to-cart') {
        triggerSmartMessage(
          'trust-support',
          'add-to-cart',
          "Still unsure? Read what other customers are saying about this item.",
          "Read Reviews",
          () => detailsAccordionRef.current?.scrollIntoView({ behavior: 'smooth' })
        );
      }

      setTimeout(() => {
        setDetections(prev => prev.filter(d => d.id !== id));
      }, 3000);
    });

    const updateInteractions = () => {
      setInteractions([...behaviorTracker.getInteractions()]);
    };

    behaviorTracker.setOnInteraction(updateInteractions);
    updateInteractions();
  }, []);

  const triggerSmartMessage = (id: string, elementId: string, message: string, actionLabel: string, action: () => void) => {
    if (activeSmartMessage?.id === id) return;
    
    setActiveSmartMessage({ id, elementId, message, actionLabel, action });
    behaviorTracker.trackSmartMessage('shown', elementId, { message });
  };

  const handleSmartMessageAction = () => {
    if (activeSmartMessage) {
      behaviorTracker.trackSmartMessage('clicked', activeSmartMessage.elementId, { message: activeSmartMessage.message });
      activeSmartMessage.action();
      setActiveSmartMessage(null);
    }
  };

  const handleSmartMessageDismiss = () => {
    if (activeSmartMessage) {
      behaviorTracker.trackSmartMessage('dismissed', activeSmartMessage.elementId, { message: activeSmartMessage.message });
      setActiveSmartMessage(null);
    }
  };

  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const handleInteraction = (e: React.MouseEvent, elementId: string, elementName: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    behaviorTracker.trackClick(elementId, elementName, x, y);
  };

  const handleHoverStart = (elementId: string) => {
    behaviorTracker.trackHoverStart(elementId);
  };

  const handleHoverEnd = (e: React.MouseEvent, elementId: string, elementName: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    behaviorTracker.trackHoverEnd(elementId, elementName, x, y);
  };

  const getDetectionForElement = (elementId: string) => {
    return detections.find(d => d.elementId === elementId);
  };

  // Heatmap logic
  const frictionPoints = interactions.filter(i => ['rage_click', 'hesitation'].includes(i.type));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 relative">
      {/* Back Button */}
      {onBack && (
        <div className="absolute top-0 left-12 z-20">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-white text-veloura-ink border border-gray-200 hover:bg-gray-50 transition-all"
          >
            ← Back to Store
          </button>
        </div>
      )}

      {/* Heatmap Toggle */}
      <div className="absolute top-0 right-12 z-20">
        <button 
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            showHeatmap ? 'bg-veloura-ink text-white' : 'bg-white text-veloura-ink border border-gray-200'
          }`}
        >
          {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap Overlay'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
        {/* Heatmap Overlay Layer */}
        {showHeatmap && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-3xl">
            {frictionPoints.map((point) => (
              <motion.div
                key={point.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.4 }}
                className={`absolute w-32 h-32 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse ${
                  point.type === 'rage_click' ? 'bg-red-500' : 'bg-purple-500'
                }`}
                style={{ left: point.x, top: point.y }}
              />
            ))}
          </div>
        )}

        {/* Product Images */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 relative"
        >
          <div 
            id="main-image"
            className={`aspect-[4/5] rounded-3xl overflow-hidden glass relative group cursor-zoom-in transition-all duration-500 ${
              getDetectionForElement('main-image') ? 'ring-4 ring-purple-400 ring-offset-4' : ''
            }`}
            onClick={(e) => handleInteraction(e, 'main-image', 'Main Product Image')}
            onMouseEnter={() => handleHoverStart('main-image')}
            onMouseLeave={(e) => handleHoverEnd(e, 'main-image', 'Main Product Image')}
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            
            <AnimatePresence>
              {getDetectionForElement('main-image') && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold text-purple-600 shadow-lg"
                >
                  <AlertCircle size={14} />
                  Hesitation detected...
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute top-4 right-4 space-y-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); handleInteraction(e, 'wishlist-btn', 'Wishlist Button'); }}
                className={`p-3 rounded-full glass transition-colors ${isLiked ? 'text-pink-500 fill-pink-500' : 'text-veloura-ink'}`}
              >
                <Heart size={20} />
              </button>
              <button className="p-3 rounded-full glass text-veloura-ink">
                <Share2 size={20} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="aspect-square rounded-xl overflow-hidden glass cursor-pointer hover:ring-2 ring-veloura-accent transition-all"
                onClick={(e) => handleInteraction(e, `thumb-${i}`, `Thumbnail ${i}`)}
              >
                <img 
                  src={`${product.image}&sig=${i}`} 
                  alt={`Thumbnail ${i}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col relative"
        >
          <div className="mb-8">
            <span className="text-sm font-medium uppercase tracking-widest text-veloura-accent mb-2 block">{product.category}</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill="currentColor" />)}
              </div>
              <span className="text-sm text-gray-500">(128 Reviews)</span>
            </div>
            <p className="text-3xl font-light">{formatPrice(product.price)}</p>
          </div>

          <div className="space-y-8">
            {/* Size Selection */}
            <div className="relative">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Select Size</span>
                <button 
                  id="size-guide"
                  ref={sizeGuideRef}
                  className={`text-sm flex items-center gap-1 transition-all duration-500 ${
                    appliedFixes['size-guide'] ? 'text-white bg-veloura-accent px-3 py-1 rounded-full shadow-lg scale-110' : 'text-veloura-accent hover:underline'
                  }`}
                  onClick={(e) => handleInteraction(e, 'size-guide', 'Size Guide Link')}
                  onMouseEnter={() => handleHoverStart('size-guide')}
                  onMouseLeave={(e) => handleHoverEnd(e, 'size-guide', 'Size Guide Link')}
                >
                  <Info size={14} /> Size Guide
                  {appliedFixes['size-guide'] && <Sparkles size={12} className="ml-1" />}
                </button>
              </div>
              
              <AnimatePresence>
                {getDetectionForElement('size-guide') && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-10 right-0 glass px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-bold text-purple-600 shadow-xl border-purple-100 z-20"
                  >
                    <AlertCircle size={12} />
                    Hesitation detected...
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`grid grid-cols-4 gap-3 transition-all duration-500 relative ${
                getDetectionForElement('size-XS') || getDetectionForElement('size-S') ? 'p-2 bg-pink-50 rounded-2xl ring-2 ring-pink-200' : ''
              }`}>
                {['XS', 'S', 'M', 'L'].map((size) => (
                  <button
                    key={size}
                    id={`size-${size}`}
                    onClick={(e) => { setSelectedSize(size); handleInteraction(e, `size-${size}`, `Size ${size} Button`); }}
                    className={`py-3 rounded-xl border transition-all relative ${
                      selectedSize === size 
                        ? 'bg-veloura-ink text-white border-veloura-ink' 
                        : 'bg-white border-gray-200 hover:border-veloura-accent'
                    }`}
                  >
                    {size}
                    {getDetectionForElement(`size-${size}`) && (
                      <motion.div 
                        layoutId="detection-glow"
                        className="absolute inset-0 bg-pink-400/20 rounded-xl animate-pulse"
                      />
                    )}
                  </button>
                ))}

                {/* Smart Message for Size */}
                <div className="absolute -top-4 -right-4 z-50">
                  <SmartMessage 
                    id="size-help"
                    isVisible={activeSmartMessage?.id === 'size-help'}
                    message={activeSmartMessage?.message || ''}
                    actionLabel={activeSmartMessage?.actionLabel || ''}
                    onAction={handleSmartMessageAction}
                    onDismiss={handleSmartMessageDismiss}
                  />
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4 relative">
              <button 
                id="add-to-cart"
                onClick={(e) => handleInteraction(e, 'add-to-cart', 'Add to Cart Button')}
                onMouseEnter={() => handleHoverStart('add-to-cart')}
                onMouseLeave={(e) => handleHoverEnd(e, 'add-to-cart', 'Add to Cart Button')}
                className={`w-full py-5 text-white rounded-2xl font-semibold text-lg shadow-lg transition-all flex items-center justify-center gap-3 relative overflow-hidden ${
                  appliedFixes['add-to-cart'] 
                    ? 'bg-veloura-ink scale-105 shadow-indigo-200' 
                    : 'bg-veloura-accent shadow-pink-200 hover:bg-pink-600'
                }`}
              >
                <ShoppingBag size={22} />
                Add to Bag
                {appliedFixes['add-to-cart'] && (
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  />
                )}
              </button>

              <AnimatePresence>
                {getDetectionForElement('add-to-cart') && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 translate-x-full glass px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold text-red-600 shadow-xl border-red-100 whitespace-nowrap z-20"
                  >
                    <AlertCircle size={14} />
                    Rage clicking detected!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Smart Message for Add to Cart */}
              <div className="absolute -right-8 top-0 z-50">
                <SmartMessage 
                  id="trust-support"
                  isVisible={activeSmartMessage?.id === 'trust-support'}
                  message={activeSmartMessage?.message || ''}
                  actionLabel={activeSmartMessage?.actionLabel || ''}
                  onAction={handleSmartMessageAction}
                  onDismiss={handleSmartMessageDismiss}
                />
              </div>
              
              <button 
                id="buy-now"
                className="w-full py-5 bg-veloura-ink text-white rounded-2xl font-semibold text-lg hover:bg-slate-900 transition-all"
                onClick={(e) => handleInteraction(e, 'buy-now', 'Buy Now Button')}
              >
                Buy Now
              </button>
            </div>

            {/* Expandable Sections */}
            <div className="border-t border-gray-200 pt-6 space-y-2">
              {/* Product Details */}
              <div className="border-b border-gray-100">
                <button 
                  id="details-accordion"
                  ref={detailsAccordionRef}
                  className={`w-full flex justify-between items-center py-4 text-left group transition-all ${
                    appliedFixes['details-accordion'] ? 'text-emerald-600' : ''
                  }`}
                  onClick={(e) => {
                    handleInteraction(e, 'details-accordion', 'Details Accordion');
                    setActiveAccordion(activeAccordion === 'details' ? null : 'details');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium group-hover:text-veloura-accent transition-colors">Product Details</span>
                    {appliedFixes['details-accordion'] && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full">Optimized</span>}
                  </div>
                  <motion.div
                    animate={{ rotate: activeAccordion === 'details' ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight size={18} className="text-gray-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {activeAccordion === 'details' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="pb-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
                        {product.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Material & Care */}
              <div className="border-b border-gray-100">
                <button 
                  id="material-accordion"
                  className="w-full flex justify-between items-center py-4 text-left group"
                  onClick={(e) => {
                    handleInteraction(e, 'material-accordion', 'Material Accordion');
                    setActiveAccordion(activeAccordion === 'material' ? null : 'material');
                  }}
                >
                  <span className="font-medium group-hover:text-veloura-accent transition-colors">Material & Care</span>
                  <motion.div
                    animate={{ rotate: activeAccordion === 'material' ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight size={18} className="text-gray-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {activeAccordion === 'material' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-4 space-y-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900 mb-1 text-xs uppercase tracking-wider">Material</p>
                          <p>{product.material}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1 text-xs uppercase tracking-wider">Care Instructions</p>
                          <ul className="list-disc list-inside space-y-1">
                            {product.care.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shipping & Returns */}
              <div className="border-b border-gray-100">
                <button 
                  id="shipping-accordion"
                  ref={shippingAccordionRef}
                  className="w-full flex justify-between items-center py-4 text-left group relative"
                  onClick={(e) => {
                    handleInteraction(e, 'shipping-accordion', 'Shipping Accordion');
                    setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping');
                  }}
                  onMouseEnter={() => handleHoverStart('shipping-accordion')}
                  onMouseLeave={(e) => handleHoverEnd(e, 'shipping-accordion', 'Shipping Accordion')}
                >
                  <span className="font-medium group-hover:text-veloura-accent transition-colors">Shipping & Returns</span>
                  <motion.div
                    animate={{ rotate: activeAccordion === 'shipping' ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight size={18} className="text-gray-400" />
                  </motion.div>

                  {/* Smart Message for Shipping */}
                  <div className="absolute -top-4 -right-4 z-50">
                    <SmartMessage 
                      id="return-policy"
                      isVisible={activeSmartMessage?.id === 'return-policy'}
                      message={activeSmartMessage?.message || ''}
                      actionLabel={activeSmartMessage?.actionLabel || ''}
                      onAction={handleSmartMessageAction}
                      onDismiss={handleSmartMessageDismiss}
                    />
                  </div>
                </button>
                <AnimatePresence>
                  {activeAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-4 text-sm text-gray-600 space-y-2">
                        <p>Complimentary express shipping on all orders over ₹15,000.</p>
                        <p>Returns accepted within 14 days of delivery in original condition.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Simulation Instructions */}
      <div className="mt-20 p-8 glass rounded-3xl border-dashed border-2 border-veloura-accent/30">
        <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
          <Info className="text-veloura-accent" />
          Simulation Mode
        </h3>
        <p className="text-gray-600 mb-4">
          To test the detector, try the following "frustrated" behaviors:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <li className="bg-white/50 p-4 rounded-xl border border-white">
            <strong className="text-veloura-accent block mb-1">Rage Clicks</strong>
            Click the "Add to Bag" button {behaviorTracker.getSettings().rageClickThreshold} times rapidly.
          </li>
          <li className="bg-white/50 p-4 rounded-xl border border-white">
            <strong className="text-veloura-accent block mb-1">Hesitation</strong>
            Hover over the "Size Guide" for more than {behaviorTracker.getSettings().hesitationThreshold / 1000} seconds.
          </li>
          <li className="bg-white/50 p-4 rounded-xl border border-white">
            <strong className="text-veloura-accent block mb-1">Confusion</strong>
            Hover over the main image for a long time without clicking.
          </li>
        </ul>
      </div>
    </div>
  );
}
