// Side navigation state management hook
import { useState, useEffect, useCallback } from 'react';

interface NavPreferences {
  isExpanded: boolean;
  lastActivePedal?: string;
  expandedSections?: string[];
}

const NAV_STORAGE_KEY = 'librarian-sidenav-preferences';
const DEFAULT_PREFERENCES: NavPreferences = {
  isExpanded: true,
  expandedSections: ['connection', 'pedals'],
};

export function useSideNav() {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(NAV_STORAGE_KEY);
      if (stored) {
        const prefs: NavPreferences = JSON.parse(stored);
        return prefs.isExpanded;
      }
    } catch (error) {
      console.error('Failed to load nav preferences:', error);
    }
    return DEFAULT_PREFERENCES.isExpanded;
  });

  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(NAV_STORAGE_KEY);
      if (stored) {
        const prefs: NavPreferences = JSON.parse(stored);
        return new Set(prefs.expandedSections || DEFAULT_PREFERENCES.expandedSections);
      }
    } catch (error) {
      console.error('Failed to load nav preferences:', error);
    }
    return new Set(DEFAULT_PREFERENCES.expandedSections);
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    const preferences: NavPreferences = {
      isExpanded,
      expandedSections: Array.from(expandedSections),
    };
    try {
      localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save nav preferences:', error);
    }
  }, [isExpanded, expandedSections]);

  const toggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const collapse = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const expand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const isSectionExpanded = useCallback(
    (sectionId: string) => expandedSections.has(sectionId),
    [expandedSections]
  );

  return {
    isExpanded,
    toggle,
    collapse,
    expand,
    toggleSection,
    isSectionExpanded,
  };
}
