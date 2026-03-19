import React, {useEffect, useMemo, useState} from "react";
import {ManifestEntry} from "./DocumentViewExample";
import {Collection, Manifest} from '@iiif/presentation-3';
import {HeaderRegion} from "@globalise/common/header";

import './ManifestDropdown.css'

type ManifestDropdownProps = {
  manifests: ManifestEntry[];
  selected: string;
  onChange: (url: string) => void;
};

export function ManifestDropdown(
  {manifests, selected, onChange}: ManifestDropdownProps
) {
  const sliceLength = 5;
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const [filtered, totalCount] = useMemo(() => {
    const terms = search
      .toLowerCase()
      .split(/\s+/)
      .filter(term => !!term);
    const matches = manifests.filter(m => {
      const label = m.label.toLowerCase();
      return terms.every(t => label.includes(t));
    });
    return [matches.slice(0, sliceLength), matches.length];
  }, [manifests, search]);


  const selectedLabel = manifests
    .find(m => m.id === selected)?.label ?? selected;

  return (
    <HeaderRegion region="center">
      <div className="manifest-dropdown">
        <input
          type="text"
          value={open ? search : selectedLabel}
          placeholder="Search manifests..."
          onFocus={() => {
            setOpen(true);
            setSearch('');
          }}
          onBlur={() => {
            setTimeout(() => setOpen(false), 150);
          }}
          onChange={(e) => setSearch(e.target.value)}
        />
        {open && (
          <ul>
            {filtered.map(m => (
              <li
                key={m.id}
                className={m.id === selected ? 'selected' : ''}
                onMouseDown={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
              >
                {m.label}
              </li>
            ))}
            {totalCount > sliceLength && (
              <li className="more-info">Showing {sliceLength} of {totalCount}...</li>
            )}
          </ul>
        )}
      </div>
    </HeaderRegion>
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

export function useCollectionManifests(
  collectionUrl: string
): ManifestEntry[] {
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