export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  details: string[];
  material: string;
  care: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Ethereal Silk Gown',
    price: 24999,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800',
    description: 'A flowing masterpiece in pure mulberry silk, designed for moments that matter.',
    category: 'Couture',
    details: [
      'Floor-length silhouette',
      'Hand-rolled hems',
      'Invisible side zip closure',
      'Internal silk slip included'
    ],
    material: '100% Grade A Mulberry Silk',
    care: [
      'Dry clean only',
      'Iron on low heat',
      'Do not bleach',
      'Store in a cool, dry place'
    ]
  },
  {
    id: 'p2',
    name: 'Midnight Velvet Wrap',
    price: 18499,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
    description: 'Deep indigo velvet with a subtle sheen, offering a modern take on classic evening wear.',
    category: 'Evening Wear',
    details: [
      'Adjustable wrap waist',
      'Bell sleeves',
      'Mid-calf length',
      'Contrast silk piping'
    ],
    material: '80% Rayon, 20% Silk Velvet',
    care: [
      'Professional dry clean',
      'Steam only, do not iron',
      'Do not tumble dry'
    ]
  },
  {
    id: 'p3',
    name: 'Pearl-Encrusted Cardigan',
    price: 12299,
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80&w=800',
    description: 'Hand-finished with freshwater pearls on a soft mohair blend base.',
    category: 'Knitwear',
    details: [
      'Relaxed fit',
      'Real freshwater pearl buttons',
      'Ribbed cuffs and hem',
      'Dropped shoulders'
    ],
    material: '50% Mohair, 30% Wool, 20% Polyamide',
    care: [
      'Hand wash cold',
      'Dry flat',
      'Reshape while damp',
      'Avoid jewelry snags'
    ]
  },
  {
    id: 'p4',
    name: 'Sculpted Satin Trousers',
    price: 9899,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
    description: 'High-waisted trousers with a sharp silhouette and a luxurious satin finish.',
    category: 'Tailoring',
    details: [
      'High-rise fit',
      'Pressed creases',
      'Side pockets',
      'Tapered leg'
    ],
    material: '100% Polyester Satin',
    care: [
      'Machine wash delicate',
      'Cool iron on reverse',
      'Do not tumble dry'
    ]
  }
];

export type InteractionType = 'click' | 'hover' | 'scroll' | 'rage_click' | 'hesitation' | 'dead_click' | 'smart_message_shown' | 'smart_message_dismissed' | 'smart_message_clicked';

export interface Interaction {
  id: string;
  type: InteractionType;
  elementId: string;
  elementName: string;
  timestamp: number;
  duration?: number; // for hovers
  count?: number; // for rage clicks
  x: number;
  y: number;
  metadata?: any; // For extra info like which smart message
}

export interface UXInsight {
  id: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  elementId: string;
  timestamp: number;
  fixApplied?: boolean;
}

export interface BehaviorStats {
  rageClicks: number;
  hesitations: number;
  scrollStalls: number;
  totalInteractions: number;
  confusionScore: number;
  smartMessagesShown: number;
  smartMessagesEngaged: number;
}

export interface AppSettings {
  rageClickThreshold: number; // number of clicks
  rageClickWindow: number; // ms
  hesitationThreshold: number; // ms
  showLiveLabels: boolean;
  showHeatmapByDefault: boolean;
  enableSmartMessaging: boolean;
}
