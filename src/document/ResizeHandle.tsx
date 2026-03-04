import React from 'react';
import {Separator} from 'react-resizable-panels';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import './resize-handle.css';

type ResizeHandleProps = {
  onDoubleClick?: () => void;
};

export function ResizeHandle({onDoubleClick}: ResizeHandleProps) {
  return (
    <Separator className="resize-handle" onDoubleClick={onDoubleClick}>
      <div className="resize-handle-grip">
        <DragIndicatorIcon />
      </div>
    </Separator>
  );
}