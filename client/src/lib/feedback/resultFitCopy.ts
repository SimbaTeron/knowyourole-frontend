/** User-facing copy for the results-page fit question. No personal data, no scoring language. */
export const RESULT_FIT_COPY = {
  title: "Did this fit you?",
  hint: "One tap is enough. No name needed.",
  yes: "Yes",
  somewhat: "Somewhat",
  no: "No",
  answeredYes: "You said yes.",
  answeredSomewhat: "You said somewhat.",
  answeredNo: "You said no.",
  extraLead: "Thanks. You can add more, or stop here.",
  ratingLegend: "How close was it? (optional)",
  ratingScale: "1 means not close. 5 means very close.",
  commentLabel: "Add a short note (optional)",
  commentHint: "Do not include your name, email, or other personal information.",
  commentPlaceholder: "What felt right or off?",
  send: "Send",
  skip: "No thanks",
  thanksTitle: "Thank you.",
  thanksDetail: "This helps us see what fits.",
  saving: "Saving...",
  error: "Could not save that. Please try again.",
  wait: "Please wait a moment, then try again.",
} as const;

export const RESULT_FIT_PRIVACY_SENTENCE =
  'If you tap "Did this fit you?" on a result, we save that choice and any optional rating or short note with the result, without your name, and delete it when that result is deleted.';

export const RESULT_FIT_STUDENT_DATA_SENTENCE =
  "Students may optionally tap whether a result fit them, and that answer is stored with the result and removed with it.";
