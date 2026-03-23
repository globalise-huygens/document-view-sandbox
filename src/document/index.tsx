import React from 'react';
import {createRoot} from 'react-dom/client';
import {SplitPaneViewExample} from './example/SplitPaneViewExample';
import {reloadOnEsBuild} from "../util/reloadOnEsBuild";

if(DEV) {
  reloadOnEsBuild()
}

createRoot(document.getElementById('root')!).render(
  <SplitPaneViewExample />
);