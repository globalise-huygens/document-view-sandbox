export type EntityBody = {
  type: EntityType;
  classified_as: EntityClassification;
};
type EntityClassification = {
  id: string;
  type: string;
  _label: string;
};
const entityTypes = [
  'AppellativeStatus',
  'ClassificatoryStatus',
  'Dimension',
] as const;

export type EntityType = (typeof entityTypes)[number];

export function assertEntityBody(body: unknown): asserts body is EntityBody {
  if (!isEntityBody(body)) {
    throw new Error('Expected EntityBody');
  }
}

export const isEntityBody = (body: any): body is EntityBody =>
  body && entityTypes.includes(body.type);
