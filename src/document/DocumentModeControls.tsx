import React from 'react';
import {HeaderRegion} from '@globalise/common/header';
import SplitscreenRounded from '@mui/icons-material/SplitscreenRounded';
import ImageIcon from '@mui/icons-material/Image';
import SubjectIcon from '@mui/icons-material/Subject';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermarkOutlined';
import {setDocumentMode, useSettings} from './SettingsStore';

export type DocumentMode =
  | 'split'
  | 'facsimile'
  | 'transcription'
  | 'minimap';

type ViewMode = {
  value: DocumentMode;
  icon: typeof SplitscreenRounded;
  title: string;
  sx?: object;
};

const modes: ViewMode[] = [
  {value: 'transcription', icon: SubjectIcon, title: 'Text-only view'},
  {value: 'facsimile', icon: ImageIcon, title: 'Scan-only view'},
  {value: 'split', icon: SplitscreenRounded, title: 'Scan + text view', sx: {transform: 'rotate(90deg)'}},
  {value: 'minimap', icon: BrandingWatermarkIcon, title: 'Minimap view'},
];

export function DocumentModeControls() {
  const {documentMode: mode} = useSettings();
  return (
    <HeaderRegion region="right">
      {modes.map(({value, icon: Icon, title, sx}) => (
        <button
          key={value}
          className={value === mode ? 'active' : ''}
          onClick={() => setDocumentMode(value)}
          title={title}
        >
          <Icon fontSize="small" sx={sx} />
        </button>
      ))}
    </HeaderRegion>
  );
}