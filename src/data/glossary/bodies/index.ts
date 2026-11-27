import type { TermBody } from '../../../lib/glossary';
import { bodies01 } from './part-01';
import { bodies02 } from './part-02';
import { bodies03 } from './part-03';
import { bodies04 } from './part-04';
import { bodies05 } from './part-05';
import { bodies06 } from './part-06';
import { bodies07 } from './part-07';
import { bodies08 } from './part-08';

/** Un file per lotto di termini; ogni slug deve comparire una sola volta (verificato da tests/glossary.test.ts). */
export const bodies: Record<string, TermBody> = { ...bodies01, ...bodies02, ...bodies03, ...bodies04, ...bodies05, ...bodies06, ...bodies07, ...bodies08 };
