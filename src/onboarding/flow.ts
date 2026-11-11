import { formatLong } from './dates';
import type { Answers, AnswerValue, Option, Question } from './types';

const opts = (...pairs: [string, string][]): Option[] =>
  pairs.map(([value, label]) => ({ value, label }));

const yesNo = opts(['yes', 'Yes'], ['no', 'No']);

const isStage = (stage: string) => (a: Answers) => a.stage === stage;
const say = (...lines: string[]) => () => lines;

/**
 * The whole onboarding interview. Order matters; `when` decides which
 * questions a given user sees. Add, remove or reorder questions here —
 * the chat screen renders whatever this list says.
 */
export const FLOW: Question[] = [
  {
    id: 'name',
    prompts: say('Hey, what should I call you?'),
    input: { kind: 'text', placeholder: 'Enter your name' },
  },
  {
    id: 'stage',
    prompts: (a) => [a.name ? `Lovely to meet you, ${a.name}.` : '', 'Where are you in your journey?'].filter(Boolean),
    input: {
      kind: 'choice',
      options: opts(
        ['ttc', "I'm trying to conceive"],
        ['pregnancy', 'In pregnancy period'],
        ['postdelivery', 'Post delivery'],
      ),
    },
  },

  // ── Trying to conceive ────────────────────────────────────────────────
  {
    id: 'ttcFirstTime',
    when: isStage('ttc'),
    prompts: say('Is this your first time trying to conceive?'),
    input: { kind: 'choice', options: yesNo },
  },
  {
    id: 'ttcTenure',
    when: isStage('ttc'),
    prompts: say('How long have you been trying to conceive?'),
    input: {
      kind: 'choice',
      options: opts(
        ['starting', 'Just getting started'],
        ['1-6', '1–6 months'],
        ['6-12', '6–12 months'],
        ['12+', '12+ months'],
      ),
    },
  },
  {
    id: 'lastPeriod',
    when: isStage('ttc'),
    prompts: say('Ah, great! When did your last period start?'),
    input: { kind: 'date', range: 'past' },
  },
  {
    id: 'cycleLength',
    when: isStage('ttc'),
    prompts: say('Okay, thanks!', 'How long is your typical cycle?'),
    input: { kind: 'dial', min: 14, max: 42, initial: 28, unit: 'days' },
  },
  {
    id: 'periodLength',
    when: isStage('ttc'),
    prompts: say('And how many days does your period usually last?'),
    input: { kind: 'wheel', min: 1, max: 10, initial: 5, unit: 'days' },
  },
  {
    id: 'ovulationTracking',
    when: isStage('ttc'),
    prompts: say('Do you track ovulation?'),
    input: {
      kind: 'choice',
      options: opts(
        ['none', 'Not yet'],
        ['opk', 'OPK tests'],
        ['bbt', 'Basal body temperature'],
        ['multiple', 'Multiple methods'],
      ),
    },
  },
  {
    id: 'prenatalVitamin',
    when: isStage('ttc'),
    prompts: say('Are you taking a prenatal vitamin?'),
    input: { kind: 'choice', options: opts(['yes', 'Yes'], ['no', 'No'], ['notyet', 'Not yet']) },
  },
  {
    id: 'mood',
    when: isStage('ttc'),
    prompts: say('How are you feeling about this journey?'),
    input: {
      kind: 'choice',
      options: opts(
        ['hopeful', 'Hopeful'],
        ['excited', 'Excited'],
        ['anxious', 'A little anxious'],
        ['overwhelmed', 'Overwhelmed'],
        ['unsure', 'Not sure yet'],
      ),
    },
  },

  // ── Pregnancy ─────────────────────────────────────────────────────────
  {
    id: 'pregnancyKnows',
    when: isStage('pregnancy'),
    prompts: say('How far along are you?'),
    input: {
      kind: 'choice',
      options: opts(['dueDate', 'I know my due date'], ['weeks', 'I know how many weeks']),
    },
  },
  {
    id: 'dueDate',
    when: (a) => a.stage === 'pregnancy' && a.pregnancyKnows === 'dueDate',
    prompts: say("What's your due date?"),
    input: { kind: 'date', range: 'future' },
  },
  {
    id: 'weeksPregnant',
    when: (a) => a.stage === 'pregnancy' && a.pregnancyKnows === 'weeks',
    prompts: say('How many weeks pregnant are you?'),
    input: { kind: 'wheel', min: 1, max: 42, initial: 12, unit: 'weeks' },
  },
  {
    id: 'firstPregnancy',
    when: isStage('pregnancy'),
    prompts: say('Is this your first pregnancy?'),
    input: { kind: 'choice', options: yesNo },
  },
  {
    id: 'helpWith',
    when: isStage('pregnancy'),
    prompts: say('What would you like the most help with?'),
    input: {
      kind: 'choice',
      options: opts(
        ['understanding', 'Understanding my pregnancy'],
        ['feeling', "Tracking how I'm feeling"],
        ['appointments', 'Keeping up with appointments'],
        ['birth', 'Preparing for birth'],
      ),
    },
  },
  {
    id: 'country',
    when: isStage('pregnancy'),
    prompts: say('Where do you live?'),
    helper: 'This helps us customize your care & reminders.',
    input: { kind: 'country' },
  },
  {
    id: 'careTeam',
    when: isStage('pregnancy'),
    prompts: say('Who is part of your care team?'),
    input: {
      kind: 'choice',
      options: opts(['obgyn', 'OB-GYN'], ['midwife', 'Midwife'], ['familyDoctor', 'Family doctor']),
      other: 'Other',
    },
  },
  {
    id: 'hasAppointment',
    when: isStage('pregnancy'),
    prompts: say('Do you have a next appointment?'),
    input: { kind: 'choice', options: opts(['yes', 'Yes'], ['notyet', 'Not yet']) },
  },
  {
    id: 'appointmentDate',
    when: (a) => a.stage === 'pregnancy' && a.hasAppointment === 'yes',
    prompts: say("Cool. When's your next appointment?"),
    input: { kind: 'date', range: 'future' },
  },
  {
    id: 'monitoring',
    when: isStage('pregnancy'),
    prompts: say('Is there anything your care team is monitoring?'),
    input: {
      kind: 'choice',
      options: opts(
        ['complications', 'Pregnancy complications'],
        ['bloodPressure', 'High blood pressure'],
        ['gestationalDiabetes', 'Gestational diabetes'],
        ['nothing', 'Nothing'],
        ['undisclosed', 'Prefer not to say'],
      ),
      other: 'Type anything',
      otherMultiline: true,
    },
  },

  // ── Post delivery ─────────────────────────────────────────────────────
  {
    id: 'babyName',
    when: isStage('postdelivery'),
    prompts: say("What's your baby's name?"),
    input: { kind: 'text', placeholder: 'Enter baby name' },
  },
  {
    id: 'babyBorn',
    when: isStage('postdelivery'),
    prompts: (a) => [`When was ${a.babyName || 'your baby'} born?`],
    input: { kind: 'date', range: 'past' },
  },
  {
    id: 'preterm',
    when: isStage('postdelivery'),
    prompts: (a) => [`Was ${a.babyName || 'your baby'} born before 37 weeks?`],
    input: { kind: 'choice', options: yesNo },
  },
  {
    id: 'weeksAtBirth',
    when: (a) => a.stage === 'postdelivery' && a.preterm === 'yes',
    prompts: say('How many weeks were they at birth?'),
    input: { kind: 'wheel', min: 22, max: 36, initial: 34, unit: 'weeks' },
  },
  {
    id: 'nicu',
    when: (a) => a.stage === 'postdelivery' && a.preterm === 'yes',
    prompts: say('Did your baby spend time in the NICU?'),
    input: { kind: 'choice', options: yesNo },
  },
  {
    id: 'feeding',
    when: isStage('postdelivery'),
    prompts: say('How are you feeding your baby right now?'),
    input: {
      kind: 'choice',
      options: opts(
        ['breastfeeding', 'Breastfeeding'],
        ['formula', 'Formula'],
        ['combination', 'Combination'],
        ['pumping', 'Pumping'],
      ),
    },
  },
  {
    id: 'parentingWith',
    when: isStage('postdelivery'),
    prompts: say('Who are you parenting with?'),
    input: {
      kind: 'choice',
      options: opts(['partner', 'Partner'], ['coparent', 'Co-parent'], ['solo', "I'm doing this solo"]),
    },
  },
  {
    id: 'focus',
    when: isStage('postdelivery'),
    prompts: say('What matters most right now?'),
    input: {
      kind: 'choice',
      options: opts(
        ['feeding', 'Feeding'],
        ['sleep', 'Sleep'],
        ['growth', 'Growth'],
        ['milestones', 'Milestones'],
        ['recovery', 'My recovery'],
      ),
    },
  },
];

export function visibleQuestions(answers: Answers): Question[] {
  return FLOW.filter((q) => !q.when || q.when(answers));
}

/** How an answer reads in a chat bubble or on the summary. */
export function labelFor(questionId: string, value: AnswerValue | undefined): string {
  if (value === undefined || value === '') return '';
  const q = FLOW.find((item) => item.id === questionId);
  if (!q) return String(value);
  switch (q.input.kind) {
    case 'choice':
      return q.input.options.find((o) => o.value === value)?.label ?? String(value);
    case 'date':
      return formatLong(String(value));
    case 'dial':
    case 'wheel':
      return `${value} ${q.input.unit}`;
    default:
      return String(value);
  }
}
