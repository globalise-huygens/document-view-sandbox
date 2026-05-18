import {createRoot} from 'react-dom/client';
import {SplitPaneViewExample} from './SplitPaneViewExample';
import {DocumentViewExample} from './DocumentViewExample';
import {getExampleFromUrl} from '../util/getExampleFromUrl';
import {reloadOnEsBuild} from '../util/reloadOnEsBuild';

if(DEV) {
  reloadOnEsBuild()
}

const examples = ['document', 'splitpane'] as const;

const components = {
  'document': DocumentViewExample,
  'splitpane': SplitPaneViewExample,
};

const example = getExampleFromUrl(examples);
const Component = components[example];

createRoot(document.getElementById('root')!).render(
  <Component />
);