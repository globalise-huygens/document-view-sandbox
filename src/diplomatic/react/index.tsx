import React from 'react';
import {createRoot} from 'react-dom/client';
import {$} from "../example/$";
import {Example} from "./example/Example";


document.addEventListener('DOMContentLoaded', () => {
  const $root = $('#root');
  const root = createRoot($root);
  root.render(<Example/>);
});