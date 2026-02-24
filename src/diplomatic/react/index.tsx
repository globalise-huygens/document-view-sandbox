import React from 'react';
import {createRoot} from 'react-dom/client';
import {$} from "../example/$";
import {Example} from "./example/Example";

import "@knaw-huc/original-layout/style.css";
import '../../../packages/line-by-line/src/normalized.css';

document.addEventListener('DOMContentLoaded', () => {
  const $root = $('#root');
  const root = createRoot($root);
  root.render(<Example/>);
});