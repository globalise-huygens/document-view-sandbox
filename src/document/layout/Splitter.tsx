import React, {HTMLAttributes} from 'react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {DividerProps} from 'react-split-pane';
import {Direction} from './useLayoutDirection';

import './Splitter.css';

type SplitterProps = DividerProps & {
  onDoubleClick?: () => void;
  direction?: Direction;
};

export function Splitter(
  {
    onDoubleClick,
    direction = 'horizontal',
    isDragging,
    className,
    ...props
  }: SplitterProps
) {
  const classNames = [
    'splitter',
    direction,
    className,
  ];

  if (isDragging) {
    classNames.push('active');
  }

  const {currentSize, minSize, maxSize, ...divProps} = props;

  return (
    <div
      className={classNames.join(' ')}
      onDoubleClick={onDoubleClick}
      {...divProps}
    >
      <div className="splitter-grip">
        <DragIndicatorIcon className="grip-icon" />
      </div>
    </div>
  );
}