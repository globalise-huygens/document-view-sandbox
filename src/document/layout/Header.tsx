import React, {useContext} from 'react';
import {HeaderContext} from '@globalise/common/header';

import './Header.css';

export function HeaderBar() {
  const {setLeft, setCenter, setRight} = useContext(HeaderContext);
  return (
    <div className="header">
      <div ref={setLeft} className="region" />
      <div ref={setCenter} className="region center" />
      <div ref={setRight} className="region" />
    </div>
  );
}