import React from 'react';
import {BasicExample} from './BasicExample';
import {getExampleFromUrl} from "../../util/getExampleFromUrl";
import { $ } from '../../diplomatic/example/$';

const examples = ['basic'] as const;

export function Example() {
  const example = getExampleFromUrl(examples);
  $(`a.${example}`)?.classList.add('active');
  if (example === 'basic') {
    return <BasicExample/>;
  } else {
    return 'Unknown example';
  }
}