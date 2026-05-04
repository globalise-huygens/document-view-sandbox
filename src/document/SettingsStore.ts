import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {DocumentMode} from "./DocumentModeControls";

export type TranscriptionMode = 'diplomatic' | 'line-by-line';

export type SettingsState = {
  documentMode: DocumentMode
  paneRatio: number;
  transcriptionMode: TranscriptionMode;
  diplomaticViewScale: number;
};

const defaultSettings: SettingsState = {
  documentMode: 'split',
  paneRatio: 0.5,
  transcriptionMode: 'diplomatic',
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

export function setDocumentMode(documentMode: DocumentMode) {
  useSettingsStore.setState({documentMode});
}
export function setPaneRatio(paneRatio: number) {
  useSettingsStore.setState({paneRatio});
}

export function setDiplomaticViewScale(diplomaticScale: number) {
  useSettingsStore.setState({diplomaticViewScale: diplomaticScale});
}

export function setTranscriptionMode(transcriptionMode: TranscriptionMode) {
  useSettingsStore.setState({transcriptionMode});
}

export function resetScaling() {
  const {diplomaticViewScale, paneRatio} = defaultSettings;
  useSettingsStore.setState({diplomaticViewScale, paneRatio});
}
