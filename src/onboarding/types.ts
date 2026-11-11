export type AnswerValue = string | number;
export type Answers = Record<string, AnswerValue | undefined>;

export type Option = { value: string; label: string };

export type Input =
  | { kind: 'text'; placeholder: string }
  | {
      kind: 'choice';
      options: Option[];
      /** Placeholder for an optional free-text answer shown under the chips. */
      other?: string;
      /** Larger multi-line free-text box instead of a single line. */
      otherMultiline?: boolean;
    }
  | { kind: 'date'; range: 'past' | 'future' }
  | { kind: 'dial'; min: number; max: number; initial: number; unit: string }
  | { kind: 'wheel'; min: number; max: number; initial: number; unit: string }
  | { kind: 'country' };

export type Question = {
  id: string;
  /** One chat bubble per string. */
  prompts: (answers: Answers) => string[];
  input: Input;
  /** Small note shown above the input. */
  helper?: string;
  /** The question is skipped when this returns false. */
  when?: (answers: Answers) => boolean;
};
