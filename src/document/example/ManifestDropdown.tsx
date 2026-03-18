import React, {useEffect, useRef, useState} from "react";
import {ManifestEntry} from "./DocumentViewExample";

import './ManifestDropdown.css'
import {Collection, Manifest} from '@iiif/presentation-3';

export function ManifestDropdown({manifests, selected, onChange}: {
  manifests: ManifestEntry[];
  selected: string;
  onChange: (url: string) => void;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);

  return (
    <select
      className="manifest-dropdown"
      ref={selectRef}
      value={selected}
      onChange={(e) => {
        onChange(e.target.value);
      }}
    >
      {!manifests.some(m => m.id === selected) && (
        <option value={selected}>{selected}</option>
      )}
      {manifests.map(m => (
        <option key={m.id} value={m.id}>{m.label}</option>
      ))}
    </select>
  );
}

const untitled = 'untitled';
export function getLabel(label: unknown): string {
  if (!label) {
    return untitled;
  }
  if (typeof label === 'string') {
    return label;
  }
  const values = Object.values(label as Record<string, string[]>).flat();
  return values[0] ?? untitled;
}

export function useCollectionManifests(collectionUrl: string): ManifestEntry[] {
  const [manifests, setManifests] = useState<ManifestEntry[]>([]);

  useEffect(() => {
    fetch(collectionUrl)
      .then(r => r.json())
      .then((collection: Collection) => {
        const items = (collection.items ?? [])
          .filter((item): item is Manifest => item.type === 'Manifest')
          .map(item => ({
            id: item.id,
            label: getLabel(item.label),
          }));
        setManifests(items);
      })
      .catch(console.error);
  }, [collectionUrl]);

  return manifests;
}