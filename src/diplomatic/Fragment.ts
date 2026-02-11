import {Id} from "./Id";

/**
 * Text unit as recognized by hcr mapped to
 * its original position with a svg path
 */
export type Fragment = {
  id: Id
  text: string
  path: string
}