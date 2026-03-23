import React from 'react';
import {HeaderRegion} from '@globalise/common/header';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ImageIcon from '@mui/icons-material/Image';
import SubjectIcon from '@mui/icons-material/Subject';
import MapIcon from '@mui/icons-material/Map';

type ViewModeToggleProps = {
  mode: DocumentViewMode;
  onClick: (mode: DocumentViewMode) => void;
};

const modes: ViewMode[] = [
  {value: 'transcription', icon: SubjectIcon, title: 'Text-only view'},
  {value: 'facsimile', icon: ImageIcon, title: 'Scan-only view'},
  {value: 'split', icon: ViewColumnIcon, title: 'Scan + text view'},
  {value: 'minimap', icon: MapIcon, title: 'Minimap view'},
];

export function ViewModeControls({mode, onClick}: ViewModeToggleProps) {
  return (
    <HeaderRegion region="right">
      {modes.map(({value, icon: Icon, title}) => (
        <button
          key={value}
          className={value === mode ? 'active' : ''}
          onClick={() => onClick(value)}
          title={title}
        >
          <Icon fontSize="small"/>
        </button>
      ))}
    </HeaderRegion>
  );
}

export type DocumentViewMode =
  | 'split'
  | 'facsimile'
  | 'transcription'
  | 'minimap';

type ViewMode = {
  value: DocumentViewMode;
  icon: typeof ViewColumnIcon;
  title: string;
};

