import {create} from 'zustand';
import {persist} from 'zustand/middleware';

export type ViewMode = 'diplomatic' | 'line-by-line';

export type SettingsState = {
  paneRatio: number;
  viewMode: ViewMode;
  diplomaticViewScale: number;
};

const defaultSettings: SettingsState = {
  paneRatio: 0.5,
  viewMode: 'diplomatic',
  diplomaticViewScale: 100,
};

export const useSettingsStore = create<SettingsState>()(
  /**
   * Persist settings to localStorage
   * Increment version to overwrite previous versions:
   */
  persist(
    () => ({...defaultSettings}),
    {name: 'settings', version: 0}
  )
);

export function useSettings() {
  return useSettingsStore();
}

export function setPaneRatio(paneRatio: number) {
  useSettingsStore.setState({paneRatio});
}

export function setDiplomaticViewScale(diplomaticScale: number) {
  useSettingsStore.setState({diplomaticViewScale: diplomaticScale});
}

export function setViewMode(viewMode: ViewMode) {
  useSettingsStore.setState({viewMode});
}

export function resetScaling() {
  const {diplomaticViewScale, paneRatio} = defaultSettings;
  useSettingsStore.setState({diplomaticViewScale, paneRatio});
}
