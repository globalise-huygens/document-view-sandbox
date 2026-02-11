import {TextRange} from "../highlight/Model";
import {Id} from "./Id";
import {orThrow} from "../util/orThrow";

type Group = { group: Id, ranges: TextRange[] };

/**
 * Group ranges by predicate
 */
export function groupRanges(
  textRanges: TextRange[],
  predicate: (id: Id) => boolean
): Group[] {
  const rangeByPredicateRecord = Object.groupBy(
    textRanges.filter(r => r.annotations.some(predicate)),
    r => r.annotations.find(predicate) ?? orThrow('Not found')
  );
  return Object.entries(rangeByPredicateRecord).map(([group, ranges]) => ({
    group,
    ranges: ranges ?? orThrow(`No ranges for ${group}`)
  }));
}