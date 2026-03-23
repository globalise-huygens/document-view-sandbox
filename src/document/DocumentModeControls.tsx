import React from 'react';
import {HeaderRegion} from '@globalise/common/header';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ImageIcon from '@mui/icons-material/Image';
import SubjectIcon from '@mui/icons-material/Subject';
import MapIcon from '@mui/icons-material/Map';
import {setDocumentMode, useSettings} from "./SettingsStore";

const modes: ViewMode[] = [
  {value: 'transcription', icon: SubjectIcon, title: 'Text-only view'},
  {value: 'facsimile', icon: ImageIcon, title: 'Scan-only view'},
  {value: 'split', icon: ViewColumnIcon, title: 'Scan + text view'},
  {value: 'minimap', icon: MapIcon, title: 'Minimap view'},
];

export function DocumentModeControls() {
  const {documentMode: mode} = useSettings()
  return (
    <HeaderRegion region="right">
      {modes.map(({value, icon: Icon, title}) => (
        <button
          key={value}
          className={value === mode ? 'active' : ''}
          onClick={() => setDocumentMode(value)}
          title={title}
        >
          <Icon fontSize="small"/>
        </button>
      ))}
    </HeaderRegion>
  );
}

export type DocumentMode =
  | 'split'
  | 'facsimile'
  | 'transcription'
  | 'minimap';

type ViewMode = {
  value: DocumentMode;
  icon: typeof ViewColumnIcon;
  title: string;
};

