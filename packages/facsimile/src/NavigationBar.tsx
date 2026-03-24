import {useCanvas, useViewerReady} from '@knaw-huc/osd-iiif-viewer';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { getValue } from '@iiif/helpers/i18n';

/**
 * WIP.
 * TODO: Use icons and theme
 * TODO: Remove `I'm Feeling Lucky`
 */
export function NavigationBar() {
  const ready = useViewerReady();
  const {currentIndex, current, total, goTo, next, prev} = useCanvas();

  const handleLuck = () => {
    goTo(Math.floor(Math.random() * total));
  };

  if (!ready) {
    return null;
  }

  return (
    <div className="navigation">
      <span className="info">
        {current ? getValue(current.label) : null}&nbsp;({currentIndex + 1}/{total})
      </span>
      <div className="control-bar">
        <button
          onClick={prev}
          disabled={!currentIndex}
        >
          <NavigateBeforeIcon />
        </button>
        <button onClick={handleLuck}>
          I'm Feeling Lucky
        </button>
        <button
          onClick={next}
          disabled={currentIndex === total - 1}
        >
          <NavigateNextIcon />
        </button>
      </div>
    </div>
  );
}