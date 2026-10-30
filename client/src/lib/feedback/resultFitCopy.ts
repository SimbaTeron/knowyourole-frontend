/** User-facing copy for the results-page fit question. No personal data, no scoring language. */
export const RESULT_FIT_COPY = {
  title: "Did this fit you?",
  hint: "Optional. No name needed.",
  yes: "Yes",
  no: "No",
  answeredYes: "You said yes.",
  answeredNo: "You said no.",
  thanksTitle: "Thank you.",
  thanksDetail: "This helps us see what fits.",
  saving: "Saving...",
  error: "Could not save that. Please try again.",
  wait: "Please wait a moment, then try again.",
} as const;

export const RESULT_FIT_PRIVACY_SENTENCE =
  'If you tap "Did this fit you?" on a result, we save that yes or no with the result, without your name, and delete it when that result is deleted.';

export const RESULT_FIT_STUDENT_DATA_SENTENCE =
  "Students may optionally tap whether a result fit them, and that answer is stored with the result and removed with it.";
