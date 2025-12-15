import { SpecificResourceTarget } from "../AnnoModel";

export const isSpecificResourceTarget = (
  target: any,
): target is SpecificResourceTarget =>
  target &&
  target.type === "SpecificResource" &&
  target.source &&
  target.selector;
