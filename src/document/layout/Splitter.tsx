import React, {HTMLAttributes} from 'react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {Direction} from './useLayoutDirection';

import './Splitter.css';

type ResizeHandleProps = HTMLAttributes<HTMLDivElement> & {
  onDoubleClick?: () => void;
  direction?: Direction;
  isActive?: boolean;
};

export function Splitter(
  {
    onDoubleClick,
    direction = 'horizontal',
    isActive = false,
    className,
    ...props
  }: ResizeHandleProps
) {
  const classNames = [
    'splitter',
    direction,
    className,
  ];

  if(isActive) {
    classNames.push('active')
  }

  return (
    <div
      className={classNames.join(' ')}
      onDoubleClick={onDoubleClick}
      {...props}
    >
      <div className="splitter-grip">
        <DragIndicatorIcon className="grip-icon"/>
      </div>
    </div>
  );
}