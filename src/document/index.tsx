import React from 'react';
import {createRoot} from 'react-dom/client';
import {DocumentViewExample} from './example/DocumentViewExample';
import {reloadOnEsBuild} from "../util/reloadOnEsBuild";

reloadOnEsBuild()

createRoot(document.getElementById('root')!).render(
  <DocumentViewExample />
);