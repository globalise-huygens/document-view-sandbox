import React, {useEffect, useState} from 'react';
import {getAnnotationPageIds, useCanvas} from '@knaw-huc/osd-iiif-viewer';
import {
  type Annotation,
  type AnnotationPage,
  findTextualBodyValue,
  Id,
} from '@globalise/annotation';
import {
  AnnotationDropdown
} from '../../diplomatic/react/example/AnnotationDropdown';

type MenuControlsProps = {
  onToggleAnnotation: (id: Id) => void;
};

export function MenuControls({onToggleAnnotation}: MenuControlsProps) {
  const {current} = useCanvas();
  const [words, setWords] = useState<Annotation[]>([]);

  useEffect(() => {
    if(!current) {
      return;
    }
    const url = getAnnotationPageIds(current)[0];
    if (!url) {
      setWords([]);
      return;
    }
    fetch(url)
      .then((r) => r.json())
      .then((page: AnnotationPage) => {
        setWords(page.items.filter(a =>
          a.motivation === 'supplementing' && a.textGranularity === 'word'
        ));
      });
  }, [current]);

  return (
    <span className="control-bar">
      <AnnotationDropdown
        placeholder="Toggle words"
        options={words}
        toLabel={findTextualBodyValue}
        onSelect={onToggleAnnotation}
      />
    </span>
  );
}