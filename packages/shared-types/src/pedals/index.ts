export * from './microcosm';
export * from './gen-loss-mkii';
export * from './chroma-console';
export * from './brothers-am';
export * from './clean';
export * from './cxm1978';
export * from './lossy';
export * from './mood-mkii';
export * from './onward';
export * from './preamp-mk2';
export * from './reverse-mode-c';
export * from './billy-strings-wombtone';

import type { MicrocosmState } from './microcosm';
import type { GenLossMkiiState } from './gen-loss-mkii';
import type { ChromaConsoleState } from './chroma-console';
import type { BrothersAmState } from './brothers-am';
import type { CleanState } from './clean';
import type { Cxm1978State } from './cxm1978';
import type { LossyState } from './lossy';
import type { MoodMkiiState } from './mood-mkii';
import type { OnwardState } from './onward';
import type { PreampMk2State } from './preamp-mk2';
import type { ReverseModeCState } from './reverse-mode-c';
import type { BillyStringsWombtoneState } from './billy-strings-wombtone';

import type { MicrocosmParameter } from './microcosm';
import type { GenLossMkiiParameter } from './gen-loss-mkii';
import type { ChromaConsoleParameter } from './chroma-console';
import type { BrothersAmParameter } from './brothers-am';
import type { CleanParameter } from './clean';
import type { Cxm1978Parameter } from './cxm1978';
import type { LossyParameter } from './lossy';
import type { MoodMkiiParameter } from './mood-mkii';
import type { OnwardParameter } from './onward';
import type { PreampMk2Parameter } from './preamp-mk2';
import type { ReverseModeCParameter } from './reverse-mode-c';
import type { BillyStringsWombtoneParameter } from './billy-strings-wombtone';

export type PedalState =
  | MicrocosmState
  | GenLossMkiiState
  | ChromaConsoleState
  | BrothersAmState
  | CleanState
  | Cxm1978State
  | LossyState
  | MoodMkiiState
  | OnwardState
  | PreampMk2State
  | ReverseModeCState
  | BillyStringsWombtoneState;

export type PedalParameter =
  | MicrocosmParameter
  | GenLossMkiiParameter
  | ChromaConsoleParameter
  | BrothersAmParameter
  | CleanParameter
  | Cxm1978Parameter
  | LossyParameter
  | MoodMkiiParameter
  | OnwardParameter
  | PreampMk2Parameter
  | ReverseModeCParameter
  | BillyStringsWombtoneParameter;
