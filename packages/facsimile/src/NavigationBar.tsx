import {useCanvas, useViewerReady} from "@knaw-huc/osd-iiif-viewer";

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
        {current?.label}
        &nbsp;
        ({currentIndex + 1}/{total})
      </span>
      <div className="buttons">
        <button
          onClick={prev}
          disabled={!currentIndex}
        >
          Prev
        </button>
        <button onClick={handleLuck}>
          I'm Feeling Lucky
        </button>
        <button
          onClick={next}
          disabled={currentIndex === total - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}