export interface ThinkingQuestion {
  id: string;
  category: 'logic' | 'bias' | 'statistics' | 'arguments' | 'firstPrinciples';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: { id: string; text: string; correct: boolean }[];
  explanation: string;
}

export const THINKING_QUESTIONS: ThinkingQuestion[] = [
  // LOGIC PUZZLES (10 questions)
  {
    id: "logic-1",
    category: "logic",
    difficulty: "easy",
    question: "If all roses are flowers, and some flowers fade quickly, what can we conclude?",
    options: [
      { id: "a", text: "All roses fade quickly", correct: false },
      { id: "b", text: "Some roses might fade quickly", correct: true },
      { id: "c", text: "No roses fade quickly", correct: false },
      { id: "d", text: "We cannot draw any conclusion about roses", correct: false },
    ],
    explanation: "Since some flowers fade quickly and all roses are flowers, it's possible (but not certain) that some roses are among those that fade quickly. We can't conclude 'all' or 'none' - only 'some might'."
  },
  {
    id: "logic-2",
    category: "logic",
    difficulty: "medium",
    question: "A bat and ball cost $1.10 together. The bat costs $1.00 more than the ball. How much does the ball cost?",
    options: [
      { id: "a", text: "$0.10", correct: false },
      { id: "b", text: "$0.05", correct: true },
      { id: "c", text: "$0.15", correct: false },
      { id: "d", text: "$0.01", correct: false },
    ],
    explanation: "If the ball costs $0.05, then the bat costs $1.05 (which is $1.00 more). Total: $0.05 + $1.05 = $1.10. Most people incorrectly answer $0.10, but that would make the bat $1.10, totaling $1.20."
  },
  {
    id: "logic-3",
    category: "logic",
    difficulty: "medium",
    question: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
    options: [
      { id: "a", text: "100 minutes", correct: false },
      { id: "b", text: "20 minutes", correct: false },
      { id: "c", text: "5 minutes", correct: true },
      { id: "d", text: "1 minute", correct: false },
    ],
    explanation: "Each machine makes 1 widget in 5 minutes. So 100 machines would each make 1 widget in 5 minutes, producing 100 widgets total in 5 minutes."
  },
  {
    id: "logic-4",
    category: "logic",
    difficulty: "hard",
    question: "You have two ropes that each take exactly 1 hour to burn, but burn at inconsistent rates. How can you measure exactly 45 minutes?",
    options: [
      { id: "a", text: "Light one rope, then the other when half remains", correct: false },
      { id: "b", text: "Light one rope from both ends, and the other from one end simultaneously", correct: true },
      { id: "c", text: "Cut one rope in half and time it", correct: false },
      { id: "d", text: "It's impossible with these materials", correct: false },
    ],
    explanation: "Light rope 1 from both ends (burns in 30 min) and rope 2 from one end. When rope 1 finishes, light rope 2's other end. Rope 2 will burn out in 15 more minutes. Total: 30 + 15 = 45 minutes."
  },
  {
    id: "logic-5",
    category: "logic",
    difficulty: "easy",
    question: "If some cats are black and all black things absorb heat, what must be true?",
    options: [
      { id: "a", text: "All cats absorb heat", correct: false },
      { id: "b", text: "Some cats absorb heat", correct: true },
      { id: "c", text: "No cats absorb heat", correct: false },
      { id: "d", text: "Black cats don't exist", correct: false },
    ],
    explanation: "Since some cats are black and all black things absorb heat, those black cats must absorb heat. Therefore, 'some cats absorb heat' is definitely true."
  },
  {
    id: "logic-6",
    category: "logic",
    difficulty: "medium",
    question: "Three boxes are labeled 'Apples', 'Oranges', and 'Mixed'. Each label is wrong. You can pick one fruit from one box. How do you correctly label all boxes?",
    options: [
      { id: "a", text: "Pick from the 'Apples' box", correct: false },
      { id: "b", text: "Pick from the 'Mixed' box", correct: true },
      { id: "c", text: "Pick from the 'Oranges' box", correct: false },
      { id: "d", text: "You need to pick from at least two boxes", correct: false },
    ],
    explanation: "Pick from 'Mixed' box. Since all labels are wrong, it contains only one fruit type. If you get an apple, it's the Apple box. The box labeled 'Apples' must be Oranges (can't be Mixed or correct). The 'Oranges' box must be Mixed."
  },
  {
    id: "logic-7",
    category: "logic",
    difficulty: "hard",
    question: "A lily pad doubles in size every day. If it takes 48 days to cover a pond completely, how many days does it take to cover half the pond?",
    options: [
      { id: "a", text: "24 days", correct: false },
      { id: "b", text: "47 days", correct: true },
      { id: "c", text: "36 days", correct: false },
      { id: "d", text: "12 days", correct: false },
    ],
    explanation: "Since the lily pad doubles each day, it was half the size the day before it covered the whole pond. So on day 47, it covered half. Many people incorrectly divide 48 by 2."
  },
  {
    id: "logic-8",
    category: "logic",
    difficulty: "easy",
    question: "If A is taller than B, and B is taller than C, what do we know for certain?",
    options: [
      { id: "a", text: "A is taller than C", correct: true },
      { id: "b", text: "C is taller than A", correct: false },
      { id: "c", text: "A and C are the same height", correct: false },
      { id: "d", text: "We need more information", correct: false },
    ],
    explanation: "This is transitive reasoning. If A > B and B > C, then A > C must be true. Height comparisons follow this logical pattern."
  },
  {
    id: "logic-9",
    category: "logic",
    difficulty: "medium",
    question: "A farmer has 17 sheep. All but 9 die. How many sheep does the farmer have left?",
    options: [
      { id: "a", text: "8 sheep", correct: false },
      { id: "b", text: "9 sheep", correct: true },
      { id: "c", text: "17 sheep", correct: false },
      { id: "d", text: "0 sheep", correct: false },
    ],
    explanation: "'All but 9' means 9 survived. The phrasing tricks us into calculating 17-9=8, but the answer is directly stated: all except 9 died, so 9 remain."
  },
  {
    id: "logic-10",
    category: "logic",
    difficulty: "hard",
    question: "You're in a race and pass the person in 2nd place. What place are you now in?",
    options: [
      { id: "a", text: "1st place", correct: false },
      { id: "b", text: "2nd place", correct: true },
      { id: "c", text: "3rd place", correct: false },
      { id: "d", text: "It depends on how many runners there are", correct: false },
    ],
    explanation: "If you pass the person in 2nd place, you take their position - 2nd place. You haven't passed the 1st place person, so you can't be 1st."
  },

  // BIAS DETECTION (10 questions)
  {
    id: "bias-1",
    category: "bias",
    difficulty: "easy",
    question: "A company promotes their product by saying '9 out of 10 dentists recommend it.' What should you question first?",
    options: [
      { id: "a", text: "How were the dentists selected?", correct: true },
      { id: "b", text: "Which toothpaste is best?", correct: false },
      { id: "c", text: "How many dentists exist worldwide?", correct: false },
      { id: "d", text: "What brand are they comparing to?", correct: false },
    ],
    explanation: "Selection bias is the key concern. If the company only surveyed dentists who already liked their product, the statistic is meaningless. Sample selection determines validity."
  },
  {
    id: "bias-2",
    category: "bias",
    difficulty: "medium",
    question: "You only remember the times your horoscope was accurate. This is an example of:",
    options: [
      { id: "a", text: "Confirmation bias", correct: true },
      { id: "b", text: "Hindsight bias", correct: false },
      { id: "c", text: "Anchoring bias", correct: false },
      { id: "d", text: "Availability bias", correct: false },
    ],
    explanation: "Confirmation bias is the tendency to notice and remember evidence that supports our existing beliefs while ignoring contradictory evidence."
  },
  {
    id: "bias-3",
    category: "bias",
    difficulty: "medium",
    question: "After a stock crashes, everyone says 'I knew it would happen.' This is:",
    options: [
      { id: "a", text: "Survivorship bias", correct: false },
      { id: "b", text: "Hindsight bias", correct: true },
      { id: "c", text: "Optimism bias", correct: false },
      { id: "d", text: "Groupthink", correct: false },
    ],
    explanation: "Hindsight bias is the tendency to believe, after an event has occurred, that we would have predicted or expected the outcome. It's also called the 'I-knew-it-all-along' effect."
  },
  {
    id: "bias-4",
    category: "bias",
    difficulty: "hard",
    question: "We study successful entrepreneurs to learn success secrets, ignoring failed ones with the same traits. This is:",
    options: [
      { id: "a", text: "Attribution error", correct: false },
      { id: "b", text: "Selection bias", correct: false },
      { id: "c", text: "Survivorship bias", correct: true },
      { id: "d", text: "Halo effect", correct: false },
    ],
    explanation: "Survivorship bias occurs when we only study 'survivors' (successes) and ignore failures. The same traits might exist in both groups, meaning those traits don't actually predict success."
  },
  {
    id: "bias-5",
    category: "bias",
    difficulty: "easy",
    question: "You're more likely to fear flying than driving, even though driving is statistically more dangerous. Why?",
    options: [
      { id: "a", text: "Planes are actually more dangerous", correct: false },
      { id: "b", text: "Availability bias - plane crashes are more memorable", correct: true },
      { id: "c", text: "Flying requires more training", correct: false },
      { id: "d", text: "You have more control when driving", correct: false },
    ],
    explanation: "Availability bias makes us overestimate the likelihood of dramatic, memorable events. Plane crashes make headlines; car accidents rarely do, skewing our risk perception."
  },
  {
    id: "bias-6",
    category: "bias",
    difficulty: "medium",
    question: "A negotiator starts with an extreme offer to influence the final outcome. This uses:",
    options: [
      { id: "a", text: "Framing effect", correct: false },
      { id: "b", text: "Anchoring bias", correct: true },
      { id: "c", text: "Sunk cost fallacy", correct: false },
      { id: "d", text: "Bandwagon effect", correct: false },
    ],
    explanation: "Anchoring bias means the first number presented heavily influences subsequent judgments. A high starting offer 'anchors' expectations, making the final price seem more reasonable."
  },
  {
    id: "bias-7",
    category: "bias",
    difficulty: "hard",
    question: "You've invested $10,000 in a failing project and refuse to quit because of the money already spent. This is:",
    options: [
      { id: "a", text: "Loss aversion", correct: false },
      { id: "b", text: "Endowment effect", correct: false },
      { id: "c", text: "Sunk cost fallacy", correct: true },
      { id: "d", text: "Status quo bias", correct: false },
    ],
    explanation: "The sunk cost fallacy is continuing a behavior because of previously invested resources (time, money, effort) that cannot be recovered. Past costs shouldn't affect future decisions."
  },
  {
    id: "bias-8",
    category: "bias",
    difficulty: "easy",
    question: "Everyone in a meeting agrees with the boss, even those with doubts. This is:",
    options: [
      { id: "a", text: "Authority bias", correct: false },
      { id: "b", text: "Groupthink", correct: true },
      { id: "c", text: "False consensus", correct: false },
      { id: "d", text: "Social proof", correct: false },
    ],
    explanation: "Groupthink occurs when desire for harmony in a group overrides realistic evaluation of alternatives. Dissenting opinions are suppressed to maintain group cohesion."
  },
  {
    id: "bias-9",
    category: "bias",
    difficulty: "medium",
    question: "You judge someone's entire character based on one trait (like attractiveness). This is the:",
    options: [
      { id: "a", text: "Fundamental attribution error", correct: false },
      { id: "b", text: "Halo effect", correct: true },
      { id: "c", text: "Stereotyping", correct: false },
      { id: "d", text: "Projection bias", correct: false },
    ],
    explanation: "The halo effect is when our impression of one quality (like beauty or intelligence) colors our perception of their other unrelated traits, assuming they're all positive."
  },
  {
    id: "bias-10",
    category: "bias",
    difficulty: "hard",
    question: "You believe everyone shares your opinions and views. This cognitive bias is called:",
    options: [
      { id: "a", text: "False consensus effect", correct: true },
      { id: "b", text: "Projection bias", correct: false },
      { id: "c", text: "Naive realism", correct: false },
      { id: "d", text: "Egocentric bias", correct: false },
    ],
    explanation: "The false consensus effect is the tendency to overestimate how much others agree with our beliefs, behaviors, and values. We assume our views are more common than they are."
  },

  // STATISTICAL REASONING (10 questions)
  {
    id: "stats-1",
    category: "statistics",
    difficulty: "easy",
    question: "A company claims their new diet pill helps 90% of users lose weight. What's the first thing you should question?",
    options: [
      { id: "a", text: "How was 'lose weight' defined?", correct: true },
      { id: "b", text: "What's the pill's brand name?", correct: false },
      { id: "c", text: "How much does it cost?", correct: false },
      { id: "d", text: "What celebrity endorses it?", correct: false },
    ],
    explanation: "Definition matters. 'Lose weight' could mean losing 1 pound over a year. Without knowing the definition, the 90% statistic is meaningless."
  },
  {
    id: "stats-2",
    category: "statistics",
    difficulty: "medium",
    question: "A coin has landed on heads 10 times in a row. What's the probability of heads on the next flip?",
    options: [
      { id: "a", text: "Very low - tails is 'due'", correct: false },
      { id: "b", text: "Very high - it's on a streak", correct: false },
      { id: "c", text: "50% - each flip is independent", correct: true },
      { id: "d", text: "We need more data", correct: false },
    ],
    explanation: "This is the gambler's fallacy. Each coin flip is independent - past results don't affect future outcomes. The probability remains 50% regardless of previous flips."
  },
  {
    id: "stats-3",
    category: "statistics",
    difficulty: "hard",
    question: "Hospitals A and B both treat sick patients. A has a higher death rate but treats sicker patients. Which might actually be safer?",
    options: [
      { id: "a", text: "Hospital A - despite higher death rate", correct: true },
      { id: "b", text: "Hospital B - lower is always better", correct: false },
      { id: "c", text: "They're equally safe", correct: false },
      { id: "d", text: "Impossible to determine", correct: false },
    ],
    explanation: "This is Simpson's Paradox. When you account for patient severity, Hospital A might have better outcomes for each severity level. Overall rates can be misleading without proper context."
  },
  {
    id: "stats-4",
    category: "statistics",
    difficulty: "easy",
    question: "A study finds that ice cream sales and drowning deaths are correlated. What's the most likely explanation?",
    options: [
      { id: "a", text: "Ice cream causes drowning", correct: false },
      { id: "b", text: "Drowning causes ice cream sales", correct: false },
      { id: "c", text: "A third factor (summer/heat) causes both", correct: true },
      { id: "d", text: "The correlation is just coincidence", correct: false },
    ],
    explanation: "Correlation doesn't equal causation. Both ice cream sales and swimming (hence drowning risk) increase in hot weather. The confounding variable is temperature/season."
  },
  {
    id: "stats-5",
    category: "statistics",
    difficulty: "medium",
    question: "The average salary in a company is $100,000. The CEO makes $10 million. What statistic would better represent typical employee pay?",
    options: [
      { id: "a", text: "The mean (average)", correct: false },
      { id: "b", text: "The median (middle value)", correct: true },
      { id: "c", text: "The mode (most common)", correct: false },
      { id: "d", text: "The range (highest minus lowest)", correct: false },
    ],
    explanation: "The median is less affected by extreme outliers. With a $10M CEO salary skewing the average, the median would better represent what a typical employee earns."
  },
  {
    id: "stats-6",
    category: "statistics",
    difficulty: "hard",
    question: "A test is 99% accurate. If 1% of the population has a disease and you test positive, what's roughly the chance you actually have it?",
    options: [
      { id: "a", text: "99%", correct: false },
      { id: "b", text: "50%", correct: true },
      { id: "c", text: "1%", correct: false },
      { id: "d", text: "90%", correct: false },
    ],
    explanation: "This is the base rate fallacy. With 1% disease rate, for every 100 people: 1 sick person tests positive, but ~1 healthy person also tests positive (1% false positive). So roughly 50% chance."
  },
  {
    id: "stats-7",
    category: "statistics",
    difficulty: "easy",
    question: "A survey of 50 people found 80% prefer Brand X. Why might this result be unreliable?",
    options: [
      { id: "a", text: "Sample size is too small", correct: true },
      { id: "b", text: "80% is too high a number", correct: false },
      { id: "c", text: "Surveys are never reliable", correct: false },
      { id: "d", text: "Brand X must be paying them", correct: false },
    ],
    explanation: "50 people is a small sample size. With more people surveyed, the results could change significantly. Reliable surveys typically need hundreds or thousands of respondents."
  },
  {
    id: "stats-8",
    category: "statistics",
    difficulty: "medium",
    question: "People who eat breakfast are healthier. Therefore, eating breakfast makes you healthy. What's wrong with this reasoning?",
    options: [
      { id: "a", text: "Nothing - it's logical", correct: false },
      { id: "b", text: "Healthier people might be more likely to eat breakfast", correct: true },
      { id: "c", text: "The study must be wrong", correct: false },
      { id: "d", text: "Breakfast doesn't exist", correct: false },
    ],
    explanation: "Reverse causation is possible: healthier people might have better habits overall, including eating breakfast. The causation could go either direction, or both could be caused by a third factor."
  },
  {
    id: "stats-9",
    category: "statistics",
    difficulty: "hard",
    question: "You flip a coin 3 times and get HHH. Which is more likely on the next 3 flips?",
    options: [
      { id: "a", text: "TTT (to balance out)", correct: false },
      { id: "b", text: "HHH (it's on a streak)", correct: false },
      { id: "c", text: "Both are equally likely", correct: true },
      { id: "d", text: "Neither is likely", correct: false },
    ],
    explanation: "Each sequence of 3 flips has the same probability (1/8). Past flips don't influence future ones. HHH and TTT are equally likely, as is any specific sequence like HTH."
  },
  {
    id: "stats-10",
    category: "statistics",
    difficulty: "medium",
    question: "A drug trial shows the drug reduced heart attacks by 50%. The actual numbers went from 2 in 1000 to 1 in 1000. Is this impressive?",
    options: [
      { id: "a", text: "Yes - 50% reduction is huge", correct: false },
      { id: "b", text: "The relative change sounds big, but absolute change is tiny", correct: true },
      { id: "c", text: "We need more information", correct: false },
      { id: "d", text: "Heart attacks don't matter", correct: false },
    ],
    explanation: "Relative vs absolute risk matters. '50% reduction' sounds dramatic, but going from 0.2% to 0.1% risk means treating 1000 people prevents 1 heart attack. The absolute benefit is small."
  },

  // ARGUMENT ANALYSIS (10 questions)
  {
    id: "args-1",
    category: "arguments",
    difficulty: "easy",
    question: "'You can't trust John's opinion on climate change - he's not a scientist.' This is an example of:",
    options: [
      { id: "a", text: "Ad hominem attack", correct: true },
      { id: "b", text: "Valid reasoning", correct: false },
      { id: "c", text: "Appeal to authority", correct: false },
      { id: "d", text: "Straw man argument", correct: false },
    ],
    explanation: "Ad hominem attacks the person rather than their argument. John's argument should be evaluated on its merits, not dismissed because of who he is."
  },
  {
    id: "args-2",
    category: "arguments",
    difficulty: "medium",
    question: "'Either you support unlimited free speech or you're against freedom.' This is a:",
    options: [
      { id: "a", text: "Valid dichotomy", correct: false },
      { id: "b", text: "False dichotomy (black-and-white thinking)", correct: true },
      { id: "c", text: "Slippery slope", correct: false },
      { id: "d", text: "Circular reasoning", correct: false },
    ],
    explanation: "False dichotomy presents only two options when more exist. One can support freedom while also believing some speech (like inciting violence) shouldn't be protected."
  },
  {
    id: "args-3",
    category: "arguments",
    difficulty: "hard",
    question: "'We should trust this medicine because doctors recommend it, and doctors know medicine.' What's the issue?",
    options: [
      { id: "a", text: "Doctors don't know medicine", correct: false },
      { id: "b", text: "Circular reasoning - the conclusion is assumed in the premise", correct: true },
      { id: "c", text: "There is no issue", correct: false },
      { id: "d", text: "Appeal to emotion", correct: false },
    ],
    explanation: "This is circular reasoning. The argument assumes what it's trying to prove: 'trust doctors because doctors are trustworthy.' It doesn't provide independent evidence."
  },
  {
    id: "args-4",
    category: "arguments",
    difficulty: "easy",
    question: "'Millions of people believe in astrology, so it must be true.' This is:",
    options: [
      { id: "a", text: "Solid evidence", correct: false },
      { id: "b", text: "Appeal to popularity (bandwagon fallacy)", correct: true },
      { id: "c", text: "Scientific reasoning", correct: false },
      { id: "d", text: "Common sense", correct: false },
    ],
    explanation: "Appeal to popularity assumes something is true because many believe it. But popularity doesn't determine truth - millions of people have believed false things throughout history."
  },
  {
    id: "args-5",
    category: "arguments",
    difficulty: "medium",
    question: "'If we allow students to redo tests, soon they'll expect to redo everything, and education will collapse.' This is:",
    options: [
      { id: "a", text: "Reasonable prediction", correct: false },
      { id: "b", text: "Slippery slope fallacy", correct: true },
      { id: "c", text: "Historical analysis", correct: false },
      { id: "d", text: "Statistical inference", correct: false },
    ],
    explanation: "Slippery slope assumes one small change will inevitably lead to extreme consequences without evidence for this chain reaction. Test retakes don't necessarily lead to educational collapse."
  },
  {
    id: "args-6",
    category: "arguments",
    difficulty: "hard",
    question: "Person A: 'We should reduce plastic use.' Person B: 'So you want us to live in caves without any modern conveniences?'",
    options: [
      { id: "a", text: "Valid counterargument", correct: false },
      { id: "b", text: "Straw man fallacy", correct: true },
      { id: "c", text: "Reductio ad absurdum", correct: false },
      { id: "d", text: "Thoughtful response", correct: false },
    ],
    explanation: "Straw man misrepresents someone's argument to make it easier to attack. Person A never suggested giving up all modern conveniences - just reducing plastic use."
  },
  {
    id: "args-7",
    category: "arguments",
    difficulty: "easy",
    question: "'You should vote for this candidate because they're a good person with a great family.' This appeals to:",
    options: [
      { id: "a", text: "Logic and evidence", correct: false },
      { id: "b", text: "Emotion rather than policy", correct: true },
      { id: "c", text: "Statistical data", correct: false },
      { id: "d", text: "Expert opinion", correct: false },
    ],
    explanation: "Appeal to emotion uses feelings rather than relevant evidence. Being a 'good person' doesn't address whether their policies would be effective."
  },
  {
    id: "args-8",
    category: "arguments",
    difficulty: "medium",
    question: "'We've always done it this way, so we shouldn't change.' This is an appeal to:",
    options: [
      { id: "a", text: "Evidence", correct: false },
      { id: "b", text: "Tradition", correct: true },
      { id: "c", text: "Logic", correct: false },
      { id: "d", text: "Authority", correct: false },
    ],
    explanation: "Appeal to tradition assumes past practices are best simply because they're traditional. But 'we've always done it' doesn't mean it's the best approach."
  },
  {
    id: "args-9",
    category: "arguments",
    difficulty: "hard",
    question: "'I haven't seen proof that ghosts don't exist, therefore they must exist.' This is:",
    options: [
      { id: "a", text: "Valid reasoning", correct: false },
      { id: "b", text: "Argument from ignorance", correct: true },
      { id: "c", text: "Scientific method", correct: false },
      { id: "d", text: "Logical deduction", correct: false },
    ],
    explanation: "Argument from ignorance claims something is true because it hasn't been proven false (or vice versa). Lack of disproof isn't proof of existence."
  },
  {
    id: "args-10",
    category: "arguments",
    difficulty: "medium",
    question: "'My grandfather smoked and lived to 95, so smoking can't be that bad.' What's wrong with this reasoning?",
    options: [
      { id: "a", text: "Nothing - personal experience is valid", correct: false },
      { id: "b", text: "Anecdotal evidence vs statistical evidence", correct: true },
      { id: "c", text: "Grandfather must have been lying", correct: false },
      { id: "d", text: "95 isn't old enough", correct: false },
    ],
    explanation: "Single anecdotes can't override statistical evidence. One person's survival doesn't change the overwhelming data showing smoking significantly increases health risks."
  },

  // FIRST PRINCIPLES THINKING (10 questions)
  {
    id: "fp-1",
    category: "firstPrinciples",
    difficulty: "easy",
    question: "First principles thinking means:",
    options: [
      { id: "a", text: "Following what experts say", correct: false },
      { id: "b", text: "Breaking problems down to fundamental truths", correct: true },
      { id: "c", text: "Using intuition and gut feeling", correct: false },
      { id: "d", text: "Copying what worked before", correct: false },
    ],
    explanation: "First principles thinking involves breaking down complex problems to their most basic, fundamental truths, then building up solutions from there rather than reasoning by analogy."
  },
  {
    id: "fp-2",
    category: "firstPrinciples",
    difficulty: "medium",
    question: "When Elon Musk saw rockets were expensive, what first principles question did he ask?",
    options: [
      { id: "a", text: "Which rocket company is cheapest?", correct: false },
      { id: "b", text: "What are rockets actually made of, and what do those materials cost?", correct: true },
      { id: "c", text: "How can we get government subsidies?", correct: false },
      { id: "d", text: "Can we buy used rockets?", correct: false },
    ],
    explanation: "Instead of accepting that rockets are expensive, Musk broke it down: what materials make a rocket, and what do they cost? This revealed rockets could be built for far less than existing prices."
  },
  {
    id: "fp-3",
    category: "firstPrinciples",
    difficulty: "hard",
    question: "A company says 'we can't lower prices because our competitors don't.' What first principles question challenges this?",
    options: [
      { id: "a", text: "What are competitors charging?", correct: false },
      { id: "b", text: "What's the actual cost to deliver this product/service?", correct: true },
      { id: "c", text: "What's the industry standard margin?", correct: false },
      { id: "d", text: "What do customers expect to pay?", correct: false },
    ],
    explanation: "First principles ignores what competitors do and asks: what's our actual cost? If we can deliver profitably at a lower price, competitor pricing is irrelevant."
  },
  {
    id: "fp-4",
    category: "firstPrinciples",
    difficulty: "easy",
    question: "'Everyone commutes to work, so we need bigger highways.' First principles thinking would ask:",
    options: [
      { id: "a", text: "How many lanes should highways have?", correct: false },
      { id: "b", text: "Do people actually need to be in the same location to work?", correct: true },
      { id: "c", text: "What's the fastest route?", correct: false },
      { id: "d", text: "Can we build flyovers?", correct: false },
    ],
    explanation: "First principles questions the underlying assumption: why do people need to commute? With remote work, the fundamental need for physical presence can be challenged."
  },
  {
    id: "fp-5",
    category: "firstPrinciples",
    difficulty: "medium",
    question: "The opposite of first principles thinking is:",
    options: [
      { id: "a", text: "Logical thinking", correct: false },
      { id: "b", text: "Reasoning by analogy (doing what's always been done)", correct: true },
      { id: "c", text: "Creative thinking", correct: false },
      { id: "d", text: "Strategic thinking", correct: false },
    ],
    explanation: "Reasoning by analogy means copying existing solutions without questioning fundamentals. 'We do it this way because that's how everyone does it' is the opposite of first principles."
  },
  {
    id: "fp-6",
    category: "firstPrinciples",
    difficulty: "hard",
    question: "To solve any problem from first principles, what's the essential first step?",
    options: [
      { id: "a", text: "Research what others have done", correct: false },
      { id: "b", text: "Define and question every assumption", correct: true },
      { id: "c", text: "Brainstorm solutions immediately", correct: false },
      { id: "d", text: "Calculate the budget", correct: false },
    ],
    explanation: "First principles requires identifying and questioning assumptions. Many 'obvious' constraints are actually just conventional wisdom that can be challenged."
  },
  {
    id: "fp-7",
    category: "firstPrinciples",
    difficulty: "easy",
    question: "'Education must happen in schools.' A first principles thinker would ask:",
    options: [
      { id: "a", text: "Which school is best?", correct: false },
      { id: "b", text: "What is learning, and what conditions enable it?", correct: true },
      { id: "c", text: "How long should school days be?", correct: false },
      { id: "d", text: "What subjects should be taught?", correct: false },
    ],
    explanation: "First principles questions the premise. Learning can happen anywhere - schools are just one delivery mechanism. Understanding what learning requires opens up alternatives."
  },
  {
    id: "fp-8",
    category: "firstPrinciples",
    difficulty: "medium",
    question: "A restaurant says 'We can't offer healthy food because customers want burgers.' First principles asks:",
    options: [
      { id: "a", text: "What burger toppings are popular?", correct: false },
      { id: "b", text: "What do customers actually want from their meal experience?", correct: true },
      { id: "c", text: "How can we make burgers seem healthier?", correct: false },
      { id: "d", text: "What do competitors serve?", correct: false },
    ],
    explanation: "Customers might want convenience, taste, satisfaction - not specifically 'burgers.' Understanding fundamental desires reveals how healthy options could meet those needs."
  },
  {
    id: "fp-9",
    category: "firstPrinciples",
    difficulty: "hard",
    question: "When building a new product, first principles thinking suggests you should first:",
    options: [
      { id: "a", text: "Study competitor products", correct: false },
      { id: "b", text: "Identify the core problem you're solving and why it exists", correct: true },
      { id: "c", text: "Survey what features customers want", correct: false },
      { id: "d", text: "Calculate market size", correct: false },
    ],
    explanation: "First principles starts with understanding the fundamental problem and its causes. Features, competitors, and markets are secondary to knowing why the problem exists."
  },
  {
    id: "fp-10",
    category: "firstPrinciples",
    difficulty: "medium",
    question: "'Books must be printed on paper.' First principles thinking led to:",
    options: [
      { id: "a", text: "Better paper quality", correct: false },
      { id: "b", text: "Asking what reading fundamentally requires, leading to e-readers", correct: true },
      { id: "c", text: "Cheaper printing methods", correct: false },
      { id: "d", text: "Smaller books", correct: false },
    ],
    explanation: "First principles asked: what is reading? It's consuming text, not specifically paper. This insight led to e-readers like Kindle that deliver the core experience differently."
  },

  // ADDITIONAL MIXED QUESTIONS (10 more for variety)
  {
    id: "mix-1",
    category: "logic",
    difficulty: "medium",
    question: "A doctor says: 'If you have the flu, you'll have a fever. You have a fever.' Can we conclude you have the flu?",
    options: [
      { id: "a", text: "Yes, definitely", correct: false },
      { id: "b", text: "No - fever can have other causes", correct: true },
      { id: "c", text: "Only if it's flu season", correct: false },
      { id: "d", text: "Yes, doctors are always right", correct: false },
    ],
    explanation: "This is affirming the consequent fallacy. Flu causes fever, but so do many things. Having a fever doesn't prove you have the flu - it could be a cold, infection, etc."
  },
  {
    id: "mix-2",
    category: "bias",
    difficulty: "easy",
    question: "You're more upset about losing $100 than happy about gaining $100. This is called:",
    options: [
      { id: "a", text: "Rational thinking", correct: false },
      { id: "b", text: "Loss aversion", correct: true },
      { id: "c", text: "Risk seeking", correct: false },
      { id: "d", text: "Opportunity cost", correct: false },
    ],
    explanation: "Loss aversion means losses feel psychologically more painful than equivalent gains feel good. We're wired to avoid losses more than to seek gains of equal value."
  },
  {
    id: "mix-3",
    category: "statistics",
    difficulty: "hard",
    question: "In a family with two children, if one is a girl, what's the probability both are girls?",
    options: [
      { id: "a", text: "1/2 (50%)", correct: false },
      { id: "b", text: "1/3 (33%)", correct: true },
      { id: "c", text: "1/4 (25%)", correct: false },
      { id: "d", text: "2/3 (67%)", correct: false },
    ],
    explanation: "Possible combinations: BG, GB, GG (BB is eliminated since we know one is a girl). Of three equally likely scenarios, only one (GG) has both girls. So probability is 1/3."
  },
  {
    id: "mix-4",
    category: "arguments",
    difficulty: "easy",
    question: "'This policy must be good - the president supports it!' This is an appeal to:",
    options: [
      { id: "a", text: "Evidence", correct: false },
      { id: "b", text: "Authority", correct: true },
      { id: "c", text: "Logic", correct: false },
      { id: "d", text: "Emotion", correct: false },
    ],
    explanation: "Appeal to authority claims something is true because an authority figure supports it. The policy should be evaluated on its merits, not who endorses it."
  },
  {
    id: "mix-5",
    category: "firstPrinciples",
    difficulty: "medium",
    question: "'We need faster horses' vs 'We need to get places faster.' Which is first principles thinking?",
    options: [
      { id: "a", text: "Faster horses - it's specific", correct: false },
      { id: "b", text: "Getting places faster - it identifies the core need", correct: true },
      { id: "c", text: "Both are the same", correct: false },
      { id: "d", text: "Neither is useful", correct: false },
    ],
    explanation: "First principles identifies the fundamental need (faster travel) rather than assuming the solution (horses). This thinking led to cars, trains, and planes."
  },
  {
    id: "mix-6",
    category: "logic",
    difficulty: "hard",
    question: "Statement: 'No A are B. All B are C.' What can we conclude about A and C?",
    options: [
      { id: "a", text: "All A are C", correct: false },
      { id: "b", text: "No A are C", correct: false },
      { id: "c", text: "Some A might be C", correct: true },
      { id: "d", text: "We can conclude nothing about A and C", correct: false },
    ],
    explanation: "A and B don't overlap, and all B are in C. But C might contain things other than B, potentially including some A. So some A might be C, but we can't be certain."
  },
  {
    id: "mix-7",
    category: "bias",
    difficulty: "medium",
    question: "After buying a car, you notice the same model everywhere. This is:",
    options: [
      { id: "a", text: "Confirmation bias", correct: false },
      { id: "b", text: "Baader-Meinhof phenomenon (frequency illusion)", correct: true },
      { id: "c", text: "Selection bias", correct: false },
      { id: "d", text: "The cars are actually more common now", correct: false },
    ],
    explanation: "The frequency illusion (Baader-Meinhof phenomenon) occurs when something you recently learned or acquired suddenly seems to appear everywhere. The cars were always there."
  },
  {
    id: "mix-8",
    category: "statistics",
    difficulty: "easy",
    question: "'Most accidents happen close to home, so driving far is safer.' What's wrong with this logic?",
    options: [
      { id: "a", text: "Nothing - it's correct", correct: false },
      { id: "b", text: "Most driving is done close to home (exposure time)", correct: true },
      { id: "c", text: "The statistics are wrong", correct: false },
      { id: "d", text: "Highways are more dangerous", correct: false },
    ],
    explanation: "This ignores exposure time. Most driving happens near home, so naturally more accidents occur there. Per mile driven, the risk might be equal or even higher elsewhere."
  },
  {
    id: "mix-9",
    category: "arguments",
    difficulty: "hard",
    question: "'We should reject this theory because accepting it would have terrible consequences.' This is:",
    options: [
      { id: "a", text: "Logical reasoning", correct: false },
      { id: "b", text: "Appeal to consequences", correct: true },
      { id: "c", text: "Valid scientific method", correct: false },
      { id: "d", text: "Risk analysis", correct: false },
    ],
    explanation: "Appeal to consequences judges truth based on outcomes rather than evidence. A theory's truth doesn't depend on whether its implications are pleasant or terrible."
  },
  {
    id: "mix-10",
    category: "firstPrinciples",
    difficulty: "hard",
    question: "When solving a difficult problem, first principles thinking suggests you should:",
    options: [
      { id: "a", text: "Find the smartest expert and copy them", correct: false },
      { id: "b", text: "Break it into smaller problems, question assumptions, rebuild from fundamentals", correct: true },
      { id: "c", text: "Trust your initial intuition", correct: false },
      { id: "d", text: "Look for the fastest solution", correct: false },
    ],
    explanation: "First principles involves decomposition (break into parts), questioning (challenge assumptions), and reconstruction (build solutions from verified fundamentals)."
  },
];

// Helper function to get random questions avoiding recent ones
export function getRandomQuestions(count: number = 5, excludeIds: string[] = []): ThinkingQuestion[] {
  const available = THINKING_QUESTIONS.filter(q => !excludeIds.includes(q.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Get questions by category
export function getQuestionsByCategory(category: ThinkingQuestion['category']): ThinkingQuestion[] {
  return THINKING_QUESTIONS.filter(q => q.category === category);
}

// Get questions by difficulty
export function getQuestionsByDifficulty(difficulty: ThinkingQuestion['difficulty']): ThinkingQuestion[] {
  return THINKING_QUESTIONS.filter(q => q.difficulty === difficulty);
}
