import {type ReactNode} from 'react';

import './ControlBar.css';

export function ControlBar({children}: {children: ReactNode}) {
  return <div className="control-bar">{children}</div>;
}
