import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {useCanvasNavigation} from './useCanvasNavigation';

export function CanvasControls() {
  const {ready, prev, next, goToRandom, label, position, hasPrev, hasNext} = useCanvasNavigation();

  if (!ready) {
    return null;
  }

  return (
    <div className="navigation">
      <span className="info">{label}&nbsp;{position}</span>
      <div className="control-bar">
        <button onClick={prev} disabled={!hasPrev}>
          <NavigateBeforeIcon />
        </button>
        <button onClick={goToRandom}>
          I'm Feeling Lucky
        </button>
        <button onClick={next} disabled={!hasNext}>
          <NavigateNextIcon />
        </button>
      </div>
    </div>
  );
}