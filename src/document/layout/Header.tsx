import React, {useContext} from 'react';
import {HeaderContext} from '@globalise/common/HeaderContext';

import './Header.css';

export function HeaderBar() {
  const {setLeft, setRight} = useContext(HeaderContext);
  return (
    <div className="header">
      <div ref={setLeft} className="region" />
      <div className="spacer" />
      <div ref={setRight} className="region" />
    </div>
  );
}