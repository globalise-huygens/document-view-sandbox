import {Annotation, Body} from "./anno/AnnoModel";
import {getBody} from "../highlight/example/getBody";

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

export function assertEntityBody(body: Body): asserts body is EntityBody {
  if (!isEntityBody(body)) {
    throw new Error('Expected EntityBody');
  }
}

export const isEntityBody = (body: Body): body is EntityBody => {
  if(!body) {
    return false;
  }
  const entityBody = body as EntityBody;
  return entityTypes.includes(entityBody.type);
};

export const isEntity = (
  annotation: Annotation
): annotation is Annotation<EntityBody> => {
  return isEntityBody(getBody(annotation))
};
