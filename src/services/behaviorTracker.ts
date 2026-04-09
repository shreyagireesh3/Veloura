import { Interaction, InteractionType, AppSettings } from '../types';

class BehaviorTracker {
  private interactions: Interaction[] = [];
  private clickHistory: { elementId: string; timestamp: number }[] = [];
  private hoverStarts: Map<string, number> = new Map();
  
  private settings: AppSettings = {
    rageClickThreshold: 3,
    rageClickWindow: 1000,
    hesitationThreshold: 3000,
    showLiveLabels: true,
    showHeatmapByDefault: false,
    enableSmartMessaging: true
  };

  private onInteractionCallback?: (interaction: Interaction) => void;
  private onDetectionCallback?: (type: 'rage_click' | 'hesitation', elementId: string) => void;
  private onSmartMessageCallback?: (elementId: string, message: string, actionLabel: string) => void;

  constructor() {
    try {
      // Load interactions
      const saved = localStorage.getItem('veloura_interactions');
      if (saved) {
        try {
          this.interactions = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse interactions', e);
        }
      }

      // Load settings
      const savedSettings = localStorage.getItem('veloura_settings');
      if (savedSettings) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        } catch (e) {
          console.error('Failed to parse settings', e);
        }
      }
    } catch (e) {
      console.warn('LocalStorage is not available', e);
    }
  }

  public getSettings(): AppSettings {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem('veloura_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save settings to LocalStorage', e);
    }
  }

  public setOnInteraction(callback: (interaction: Interaction) => void) {
    this.onInteractionCallback = callback;
  }

  public setOnDetection(callback: (type: 'rage_click' | 'hesitation', elementId: string) => void) {
    this.onDetectionCallback = callback;
  }

  public setOnSmartMessage(callback: (elementId: string, message: string, actionLabel: string) => void) {
    this.onSmartMessageCallback = callback;
  }

  public trackSmartMessage(type: 'shown' | 'dismissed' | 'clicked', elementId: string, metadata?: any) {
    const now = Date.now();
    const interactionType: InteractionType = 
      type === 'shown' ? 'smart_message_shown' : 
      type === 'dismissed' ? 'smart_message_dismissed' : 
      'smart_message_clicked';

    this.addInteraction({
      id: Math.random().toString(36).substr(2, 9),
      type: interactionType,
      elementId,
      elementName: `Smart Message: ${elementId}`,
      timestamp: now,
      x: 0,
      y: 0,
      metadata
    });
  }

  public triggerSmartMessage(elementId: string, message: string, actionLabel: string) {
    if (this.settings.enableSmartMessaging && this.onSmartMessageCallback) {
      this.onSmartMessageCallback(elementId, message, actionLabel);
    }
  }

  public trackClick(elementId: string, elementName: string, x: number, y: number) {
    const now = Date.now();
    this.clickHistory.push({ elementId, timestamp: now });

    // Detect rage clicks
    const recentClicks = this.clickHistory.filter(
      c => c.elementId === elementId && now - c.timestamp < this.settings.rageClickWindow
    );

    if (recentClicks.length >= this.settings.rageClickThreshold) {
      if (this.onDetectionCallback && this.settings.showLiveLabels) {
        this.onDetectionCallback('rage_click', elementId);
      }
      this.addInteraction({
        id: Math.random().toString(36).substr(2, 9),
        type: 'rage_click',
        elementId,
        elementName,
        timestamp: now,
        count: recentClicks.length,
        x,
        y
      });
      // Clear history for this element to avoid double counting
      this.clickHistory = this.clickHistory.filter(c => c.elementId !== elementId);
    } else {
      this.addInteraction({
        id: Math.random().toString(36).substr(2, 9),
        type: 'click',
        elementId,
        elementName,
        timestamp: now,
        x,
        y
      });
    }
  }

  public trackHoverStart(elementId: string) {
    this.hoverStarts.set(elementId, Date.now());
  }

  public trackHoverEnd(elementId: string, elementName: string, x: number, y: number) {
    const start = this.hoverStarts.get(elementId);
    if (start) {
      const duration = Date.now() - start;
      this.hoverStarts.delete(elementId);

      // Detect hesitation
      if (duration > this.settings.hesitationThreshold) {
        if (this.onDetectionCallback && this.settings.showLiveLabels) {
          this.onDetectionCallback('hesitation', elementId);
        }
        this.addInteraction({
          id: Math.random().toString(36).substr(2, 9),
          type: 'hesitation',
          elementId,
          elementName,
          timestamp: Date.now(),
          duration,
          x,
          y
        });
      }
    }
  }

  private addInteraction(interaction: Interaction) {
    this.interactions.push(interaction);
    this.save();
    if (this.onInteractionCallback) {
      this.onInteractionCallback(interaction);
    }
  }

  private save() {
    try {
      localStorage.setItem('veloura_interactions', JSON.stringify(this.interactions));
    } catch (e) {
      console.warn('Failed to save interactions to LocalStorage', e);
    }
  }

  public getInteractions() {
    return this.interactions;
  }

  public clear() {
    this.interactions = [];
    this.save();
  }
}

export const behaviorTracker = new BehaviorTracker();
