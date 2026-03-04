import React from 'react';
import {Separator} from 'react-resizable-panels';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {Direction} from "./useLayoutDirection";

import './resize-handle.css';

type ResizeHandleProps = {
  onDoubleClick?: () => void;
  direction?: Direction;
};

export function ResizeHandle({ onDoubleClick, direction = 'horizontal' }: ResizeHandleProps) {
  return (
    <Separator
      className="resize-handle"
      onDoubleClick={onDoubleClick}
      data-direction={direction}
    >
      <div className="resize-handle-grip">
        <DragIndicatorIcon className="grip-icon" />
      </div>
    </Separator>
  );
}