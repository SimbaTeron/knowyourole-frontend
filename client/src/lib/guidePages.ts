import { QUESTION_COUNT } from "@/lib/quiz/quizConfig";
import type { SeoFaq, SeoPage } from "@/lib/seo-pages";

/** Visible and schema date for these guides. Bump when the copy changes. */
export const GUIDE_UPDATED = "2026-10-17";
export const GUIDE_UPDATED_LABEL = "October 17, 2026";

export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type GuideLesson = {
  steps: { name: string; detail: string }[];
  bands: { name: string; prompts: string[] }[];
  exitTicket: string[];
};

export type GuidePage = {
  path: string;
  slug: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  breadcrumbs: { name: string; path: string }[];
  sections: GuideSection[];
  faqs: SeoFaq[];
  related: string[];
  lesson?: GuideLesson;
  lastModified: string;
};

const quizCount = QUESTION_COUNT;

const trades: GuidePage = {
  path: "/careers/trades-career-quiz",
  slug: "trades-career-quiz",
  title: "Trades Career Quiz: Hands-On Work | KnowYouRole",
  description:
    "A free trades career quiz for electrician, plumber, welder, carpenter, and mechanic work. It suggests directions. It does not pick a job.",
  h1: "A trades career quiz for people who like to build and fix things",
  eyebrow: "Hands-on careers",
  intro:
    "Skilled trades are real careers. Electricians, plumbers, welders, carpenters, and mechanics keep homes, shops, and job sites running. This page helps you think about whether hands-on work fits how you like to work. The quiz will not choose a trade for you.",
  breadcrumbs: [
    { name: "Career paths", path: "/careers" },
    { name: "Trades career quiz", path: "/careers/trades-career-quiz" },
  ],
  sections: [
    {
      heading: "What a trades career quiz can (and can't) tell you",
      paragraphs: [
        "KnowYouRole is a free work-style quiz. It is informed by the Big Five, a common way to describe habits such as curiosity, follow-through, and social energy. It looks at how you like to focus, decide, and spend a day.",
        "It can suggest that hands-on, practical work is worth a closer look. It cannot tell you to become an electrician, or tell you not to. A trade also depends on training, local jobs, the physical work, and what you want from a workday.",
        `The quiz is ${quizCount} questions. There is no account and no name needed. It is a reflection tool, not a test you pass.`,
      ],
    },
    {
      heading: "Work styles that often enjoy hands-on work",
      paragraphs: [
        "These are clues, not rules. A quiet person can be an excellent welder. A social person can be an excellent electrician. The quiz gives you words for your habits. You still have to try the work.",
      ],
      bullets: [
        "You like a practical problem more than an abstract one.",
        "You want to see what you made or fixed.",
        "You are willing to learn a skill one step at a time.",
        "You can picture a day that is not spent at a desk.",
        "You do not mind dirt, weather, or a noisy shop, or you want to find out if you do.",
      ],
    },
    {
      heading: "A look at common trades: electrician, plumber, HVAC, welder, carpenter, auto tech",
      paragraphs: [
        "These are a few common paths. They are not a full list, and they are not ranked. Pay, licenses, and day-to-day work differ by place.",
      ],
      bullets: [
        "Electrician: install and repair electrical systems in homes, shops, and job sites.",
        "Plumber: install and repair pipes, drains, and fixtures.",
        "Heating and cooling technician (often called HVAC): keep heating and cooling systems working.",
        "Welder: join metal for buildings, vehicles, and equipment.",
        "Carpenter: build and repair with wood, from frames to finish work.",
        "Auto technician or mechanic: diagnose and repair cars, trucks, and other machines.",
      ],
    },
    {
      heading: "Apprenticeships, career and technical classes, and community college",
      paragraphs: [
        "People start trades in more than one way. Some join an apprenticeship and learn on the job while they take classes. Some start in a high school career and technical education class. Some start at a community college.",
        "Rules differ by trade and by place. A quiz cannot tell you which door is open near you. Ask a school counselor, a community college, or a local tradesperson what the first step looks like where you live.",
      ],
    },
    {
      heading: "Questions to ask a tradesperson",
      paragraphs: [
        "A short conversation beats a guessed job title. If you can, ask someone who does the work.",
      ],
      bullets: [
        "What does a normal day look like?",
        "What is hard about this trade that people do not see?",
        "How did you get your first training?",
        "What should I try, such as a class or a job-site visit, before I decide?",
        "What do you wish you had known when you started?",
      ],
    },
    {
      heading: "Take the work style quiz",
      paragraphs: [
        `Use the free quiz as one input. Answer for how you usually work, not for the person you wish you were. Then compare the result with a real conversation or a class. [Take the free quiz](/quiz).`,
        "If creative work is the other path you are weighing, read the [creator careers quiz](/careers/creator-careers-quiz). Teens can start with the [career quiz for teens](/career-quiz-for-teens).",
      ],
    },
  ],
  faqs: [
    {
      q: "Will this quiz tell me if I should go into the trades?",
      a: "No. It can show whether hands-on, practical work is a direction worth exploring. It is not a test you pass, and it does not pick a job.",
    },
    {
      q: "Is this quiz only for people who already like tools?",
      a: "No. It is a work-style quiz. If your result points toward practical work, you can look at trades. If it points somewhere else, that is useful too.",
    },
    {
      q: "Do I need an account?",
      a: "No. You do not need an account or your name. The quiz is free. The privacy page explains what we store.",
    },
    {
      q: "Is this a hiring test?",
      a: "No. Do not use it to hire, admit, or grade anyone. It is a reflection tool for you.",
    },
  ],
  related: [
    "/quiz",
    "/careers/creator-careers-quiz",
    "/career-quiz-for-teens",
    "/methodology",
    "/careers",
  ],
  lastModified: GUIDE_UPDATED,
};

const creators: GuidePage = {
  path: "/careers/creator-careers-quiz",
  slug: "creator-careers-quiz",
  title: "Content Creator Career Quiz for Teens | KnowYouRole",
  description:
    "A free content creator career quiz for teens and adults. Video, design, music, writing, and streaming. It suggests directions. It does not promise an audience.",
  h1: "A creator careers quiz that treats making things as real work",
  eyebrow: "Creative careers",
  intro:
    "Artists, designers, musicians, writers, editors, and people who post videos or stream all practice a craft. An audience is not a personality type, and going viral is not a plan. This page is for teens and adults who want to see whether creative work fits how they like to spend a day.",
  breadcrumbs: [
    { name: "Career paths", path: "/careers" },
    { name: "Creator careers quiz", path: "/careers/creator-careers-quiz" },
  ],
  sections: [
    {
      heading: "Creator careers are more than going viral",
      paragraphs: [
        "A lot of creative work never shows up on a public page. Someone edits a video, draws a poster, writes a script, records a song, or designs a shirt. Some of that work is a job. Some of it is practice. Both count.",
        "KnowYouRole will not tell you that you should be a YouTuber, a streamer, or a designer. It will not promise followers, money, or a break. It can help you notice whether making, revising, and sharing work fits your habits.",
      ],
    },
    {
      heading: "Work styles that fit making, editing, and audience-building",
      paragraphs: [
        "Creative jobs are not all the same. Making a thing, editing it, and talking with an audience are three different kinds of work. You might like one and dislike the others. That is useful to know.",
      ],
      bullets: [
        "Making: you like starting something and staying with it until it exists.",
        "Editing: you like improving a draft, a cut, or a layout more than starting from nothing.",
        "Audience: you like explaining work to other people, on camera or in writing.",
        "Solo focus: you do your best work in a quiet stretch of time.",
        "Team craft: you like building something with other people, such as a band, a crew, or a class project.",
      ],
    },
    {
      heading: "Roles to explore: video editor, graphic designer, writer, social media manager, animator, podcast producer",
      paragraphs: [
        "Use this list as a menu, not a ranking. Many people mix two of these. A musician might also edit video. A designer might also write.",
      ],
      bullets: [
        "Artist: draw, paint, photograph, or make objects.",
        "Video editor or animator: shape pictures and motion into a piece someone can watch.",
        "Graphic designer: make layouts, posters, logos, and interfaces that people can use.",
        "Writer: write scripts, articles, captions, or stories.",
        "Musician: write, practice, record, or perform music.",
        "YouTuber or streamer: show work, or a live activity, to an audience. The showing is its own skill, separate from the craft.",
        "Social media manager or podcast producer: plan, edit, and publish other people's work on a schedule.",
      ],
    },
    {
      heading: "Skills you can practice now, including school-safe ideas",
      paragraphs: [
        "You do not need a channel or a brand to practice. School and home are enough for a first try.",
      ],
      bullets: [
        "Make a poster or slide deck for a club, team, or class.",
        "Edit a short video for a school event, with permission from the people in it.",
        "Write for a school paper, a class blog, or a script your friends can read aloud.",
        "Record a song or a podcast episode with a class, and keep it inside the school if that is the rule.",
        "Offer to design a simple logo for a student group.",
        "Ask an art, music, or media teacher what a next class or club looks like.",
      ],
    },
    {
      heading: "What the day-to-day really looks like",
      paragraphs: [
        "Public posts are the visible minute. The rest of the day is practice, revision, file cleanup, feedback, and starting again when a piece does not work. Some days are solitary. Some days are meetings.",
        "If you only like the idea of being seen, and not the making or the editing, look at that honestly. If you love the making and hate being on camera, there are still creative jobs. The quiz can point at the habit. It cannot see your portfolio.",
      ],
    },
    {
      heading: "Try the quiz",
      paragraphs: [
        `Take the free ${quizCount}-question work-style quiz and read the result as a starting point. [Take the free quiz](/quiz). Then make one small thing this month and notice whether you want to do it again.`,
        "Teens can also read the [career quiz for teens](/career-quiz-for-teens). If you are comparing creative work with a hands-on trade, read the [trades career quiz](/careers/trades-career-quiz).",
      ],
    },
  ],
  faqs: [
    {
      q: "Is this a creative career test that tells teens what to become?",
      a: "No. It is a work-style quiz. It can suggest that making, editing, or sharing work is worth trying. It does not assign a job or promise an audience.",
    },
    {
      q: "Do I need followers before the result is useful?",
      a: "No. The quiz does not look at a channel, a portfolio, or a follower count. It asks how you like to work.",
    },
    {
      q: "Is the quiz free, and do I need an account?",
      a: "The quiz is free. You do not need an account or your name. See the privacy page for what we store.",
    },
    {
      q: "Can a school use this in class?",
      a: "Yes, as a reflection activity. It is not for grades or placement. Counselors can use the free lesson plan on the for-counselors page.",
    },
  ],
  related: [
    "/quiz",
    "/career-quiz-for-teens",
    "/careers/trades-career-quiz",
    "/personality-quiz-for-students",
    "/for-counselors",
  ],
  lastModified: GUIDE_UPDATED,
};

const teens: GuidePage = {
  path: "/career-quiz-for-teens",
  slug: "career-quiz-for-teens",
  title: "Free Career Quiz for Teens, No Sign-Up | KnowYouRole",
  description:
    "A free career quiz for middle school and high school students. No account or name needed. It suggests directions. It does not pick your job.",
  h1: "A free career quiz for teens, with no account needed",
  eyebrow: "For students",
  intro:
    "You do not need a job title yet. You need a clearer picture of how you like to work, and a few directions worth trying. This quiz is free. You do not make an account, and you do not enter your name.",
  breadcrumbs: [{ name: "Career quiz for teens", path: "/career-quiz-for-teens" }],
  sections: [
    {
      heading: "A free career quiz for teens, with no account needed",
      paragraphs: [
        `KnowYouRole is a free, ${quizCount}-question work-style quiz. It is informed by the Big Five, a common way to describe habits such as curiosity, follow-through, and social energy. It suggests directions. It does not tell you what job to do.`,
        "If you want the personality side in more detail, read the [personality quiz for students](/personality-quiz-for-students). This page stays on career exploration: what to try next, not a label to keep.",
      ],
    },
    {
      heading: "What you'll get: work style, strengths, directions to explore",
      paragraphs: [
        "You get plain language about how you like to focus, decide, and work with other people. You also get directions you might explore, which can include hands-on trades, creative work, helping roles, or more structured work.",
        "You will not get a score that says you passed. You will not get a single correct career. Treat anything that sounds too certain as a prompt to check against your real life.",
      ],
    },
    {
      heading: "How to use your result: three small next steps",
      paragraphs: ["Keep the next step small. A result is not a decision."],
      bullets: [
        "Read the result and mark what sounds true, and what does not.",
        "Talk with a parent, teacher, or counselor about one direction. The [for parents](/for-parents) and [for counselors](/for-counselors) pages are written for them.",
        "Try one real thing: a class, a club, a short project, or a conversation with someone who does that work.",
      ],
    },
    {
      heading: "Middle school vs high school: what changes",
      paragraphs: [
        "In middle school, the useful question is what kind of activities you want more of. Clubs, electives, and helping at home are enough data. You are not behind if you do not have a career.",
        "In high school, the menu gets wider: career and technical classes, community college, a first job, a portfolio, or college majors. The quiz still does not pick among them. It can help you choose which conversation to have this semester.",
      ],
    },
    {
      heading: "Why no quiz should pick your career for you",
      paragraphs: [
        "A quiz only hears what you report today. It does not see your town, your training options, your health, your family, or the work you have not tried yet. Two people with a similar result can want different lives.",
        "Use it to shorten the list of things to try. Then let real experience change the list.",
      ],
    },
    {
      heading: "What we store, in plain English",
      paragraphs: [
        "You can finish the quiz without an account and without your name. We save the quiz completion so your result can be shown and recovered. We do not sell quiz results. Analytics is optional and stays off until someone turns it on in cookie settings.",
        "If you are under 13, do not enter an email or other personal information unless a parent or guardian says you may. Read [what we store](/privacy). Parents can read [for parents](/for-parents).",
      ],
    },
  ],
  faqs: [
    {
      q: "Is this a free career test for high school students with no sign-up?",
      a: "Yes. The quiz is free. You do not create an account, and you do not enter your name to see a result.",
    },
    {
      q: "Will it tell me my future job?",
      a: "No. It suggests work-style directions to explore. It is not a test you pass, and it is not a diagnosis.",
    },
    {
      q: "Can I take it in middle school?",
      a: "Yes. Use the result to choose activities to try, not a lifelong job. If you are under 13, do not add personal information without a parent.",
    },
    {
      q: "What if I disagree with the result?",
      a: "That is allowed. Mark the parts that miss, and trust a real class or project over a paragraph on a screen.",
    },
  ],
  related: [
    "/quiz",
    "/personality-quiz-for-students",
    "/for-parents",
    "/for-counselors",
    "/careers/trades-career-quiz",
    "/careers/creator-careers-quiz",
    "/privacy",
  ],
  lastModified: GUIDE_UPDATED,
};

const parents: GuidePage = {
  path: "/for-parents",
  slug: "for-parents",
  title: "Career Quiz for Your Teenager | KnowYouRole for Parents",
  description:
    "A plain guide for parents: what this free work-style quiz is, what it is not, and how family privacy works. No account or name is needed.",
  h1: "A career quiz for your teenager, explained for parents",
  eyebrow: "For parents",
  intro:
    "You want something useful, and you want to know it is safe to let your teen try. KnowYouRole is a free work-style quiz. It suggests directions to explore. It does not tell your child what job to do, and it is not a diagnosis.",
  breadcrumbs: [{ name: "For parents", path: "/for-parents" }],
  sections: [
    {
      heading: "What KnowYouRole is, and what it isn't",
      paragraphs: [
        `It is a free, ${quizCount}-question quiz about how a person likes to work. It is informed by the Big Five, a common way to describe habits such as curiosity, follow-through, and social energy. The result is a starting point for a conversation.`,
        "It is not a clinical test, not a school placement tool, and not a verdict. A teen can disagree with it. You can too. The [method page](/methodology) explains the limits in more detail.",
      ],
    },
    {
      heading: "Privacy for families: no account or name needed, what is stored, how to ask for deletion",
      paragraphs: [
        "Your teen can take the quiz without an account and without entering a name. We save the quiz completion so the result can be shown and recovered. We do not sell quiz results. Optional analytics stays off until someone turns it on.",
        "To ask for deletion, export, or a correction, email info@knowyourole.com. Include enough detail for us to find the record, such as a result identifier if you have one. We may need to verify the request before acting on it. The full wording is on the [privacy page](/privacy).",
      ],
    },
    {
      heading: "Under-13s and school use",
      paragraphs: [
        "If your child is under 13, they should not provide an email address or other personal information unless you agree. We do not knowingly collect personal information from children under 13 without appropriate consent. If you believe a child under 13 did so, contact us and we will review the deletion request.",
        "A school may use the quiz as a class activity. Students still do not need an account. Your school's own rules apply. Read [for schools](/for-schools) and, if you advise a counselor, [for counselors](/for-counselors).",
      ],
    },
    {
      heading: "Talking with your teen about their result",
      paragraphs: [
        "Five ways to start. You are listening for what they want to try, not closing a case.",
      ],
      bullets: [
        "What part of the result sounded like you?",
        "What part did not?",
        "Which kind of day sounded interesting: making, fixing, helping, or organizing?",
        "What is one small thing you could try this month that is not a big decision?",
        "Who else should we ask, such as a teacher or someone who does that work?",
      ],
    },
    {
      heading: "Trades, college, creative work: keeping options open",
      paragraphs: [
        "A useful result leaves more than one door open. Hands-on trades, college majors, and creative work can all be worth a look. None of them is a consolation prize.",
        "If your teen is curious about fixing and building, read the [trades career quiz](/careers/trades-career-quiz). If they are curious about art, video, music, or design, read the [creator careers quiz](/careers/creator-careers-quiz). They can [take the quiz](/quiz) themselves when they are ready.",
      ],
    },
  ],
  faqs: [
    {
      q: "Is this personality quiz safe for my kid?",
      a: "It does not ask for a name or an account. It is not a medical or mental-health test. Read the privacy page for what is stored, and do not have a child under 13 enter personal information without your OK.",
    },
    {
      q: "Will it tell my teenager what career to choose?",
      a: "No. It suggests directions to explore. You and your teen still decide what to try.",
    },
    {
      q: "Does my teen have to give an email?",
      a: "No. Email is only used if someone later asks to have a result summary sent. The quiz itself does not require it.",
    },
    {
      q: "How do I ask you to delete something?",
      a: "Email info@knowyourole.com, as the privacy page describes. We may need to verify the request.",
    },
  ],
  related: ["/quiz", "/privacy", "/career-quiz-for-teens", "/for-counselors", "/for-schools", "/methodology"],
  lastModified: GUIDE_UPDATED,
};

const counselors: GuidePage = {
  path: "/for-counselors",
  slug: "for-counselors",
  title: "Free Career Lesson Plan for School Counselors | KnowYouRole",
  description:
    "A free career exploration lesson for class or a counseling group. No student accounts. Includes a lesson plan you can print. Not for placement or grades.",
  h1: "A free career exploration lesson for counselors and teachers",
  eyebrow: "For counselors",
  intro:
    "This is a ready-to-run reflection lesson. Students take the free work-style quiz, talk in pairs, and leave with one next step. You do not collect student accounts. The lesson is not for placement, grading, or hiring.",
  breadcrumbs: [{ name: "For counselors", path: "/for-counselors" }],
  sections: [
    {
      heading: "A free career reflection lesson for one class period",
      paragraphs: [
        `The activity is a warm-up, the free ${quizCount}-question quiz, a pair talk, and an exit ticket. Many groups can finish in one class period. If the quiz runs long, save the pair talk for the next meeting.`,
        "The [for schools](/for-schools) page is the technical and policy overview. This page is the lesson you can run.",
      ],
    },
    {
      heading: "Before class: setup with no student accounts",
      paragraphs: [
        "Students open the quiz in a browser. They do not create an account, and they do not enter a name. Ask them not to put their name in any free-text answer.",
        "Check that your network allows knowyourole.com. Read the [privacy policy](/privacy) and the [for schools](/for-schools) page before a group uses the site. Your district's own student-data rules still control.",
      ],
      bullets: [
        "One device per student, or pairs sharing a screen if devices are short.",
        "A way to print or copy the exit ticket, or a notebook line for the same prompt.",
        "A reminder you will say out loud: this is not a grade and not a placement.",
      ],
    },
    {
      heading: "Lesson plan: warm-up, quiz, pair discussion, exit ticket",
      paragraphs: [
        "Run the steps below in order. The same steps are repeated in the printable kit so you can hand them out or print them.",
      ],
    },
    {
      heading: "Discussion prompts by grade band (grades 7–8 and grades 9–12)",
      paragraphs: [
        "Use the younger prompts when the goal is activities and electives. Use the older prompts when students are comparing classes, jobs, and training paths. Do not push either group to lock in a career.",
      ],
    },
    {
      heading: "Using results responsibly: not for placement or grading",
      paragraphs: [
        "Do not use a result to place a student in a class, a program, or a job. Do not grade it. Do not read results aloud unless the student offers. A result is that student's reflection, not a record you need to file.",
        "If a result worries you because of something the student says out loud, follow your school's normal support process. The quiz itself is not a mental-health screening.",
      ],
    },
    {
      heading: "Student data at a glance",
      paragraphs: [
        "Students can finish without an account and without a name. Quiz completions are saved so a result can be shown and recovered. We do not sell quiz results. Analytics is optional and off until someone accepts it.",
        "The [privacy policy](/privacy) is the page that lists what is stored and how to email a deletion request. This lesson page does not add a separate promise. Schools should follow their own rules on top of that.",
      ],
    },
    {
      heading: "Printable lesson kit",
      paragraphs: [
        "The kit is this page. Print it. There is no email form and no file to unlock. The block below is the handout: setup, steps, prompts, and the exit ticket.",
      ],
    },
  ],
  lesson: {
    steps: [
      {
        name: "Warm-up",
        detail: "Ask students to name one activity from the last month that they would gladly do again, and one they would skip. No one has to share with the whole class.",
      },
      {
        name: "Quiz",
        detail: `Students open the free quiz and answer the ${quizCount} questions for their usual habits, not for a best-self version. They do not enter a name.`,
      },
      {
        name: "Pair discussion",
        detail: "In pairs, each student shares one line that sounded true and one line that did not. The listener does not argue them into a career.",
      },
      {
        name: "Exit ticket",
        detail: "Each student writes one direction to learn more about, and one person or class that could help. They keep the paper. You do not need to collect scores.",
      },
    ],
    bands: [
      {
        name: "Grades 7–8",
        prompts: [
          "Which kind of activity do you want more of this year?",
          "What did the result get wrong?",
          "Who at school already does something you are curious about?",
        ],
      },
      {
        name: "Grades 9–12",
        prompts: [
          "Which direction is worth a class, a job shadow, or a project this semester?",
          "What would you need to see in a normal workday before you took that path seriously?",
          "What option are you keeping open on purpose?",
        ],
      },
    ],
    exitTicket: [
      "One direction I want to learn more about:",
      "One thing the result got wrong or left out:",
      "One person, class, or shop I can ask next:",
    ],
  },
  faqs: [
    {
      q: "Is this career lesson plan free for school counselors?",
      a: "Yes. The lesson, the quiz, and the printable kit on this page are free. There is no email signup.",
    },
    {
      q: "Do students need accounts?",
      a: "No. Students can take the quiz without an account and without a name.",
    },
    {
      q: "Can I use the result for class placement or a grade?",
      a: "No. Use it as a conversation. Do not place, rank, or grade students with it.",
    },
    {
      q: "Where do I read what student data is stored?",
      a: "On the privacy policy. The for-schools page covers school and network questions. Your district's rules still apply.",
    },
  ],
  related: ["/for-schools", "/quiz", "/privacy", "/for-parents", "/career-quiz-for-teens", "/methodology"],
  lastModified: GUIDE_UPDATED,
};

export const guidePages: GuidePage[] = [trades, creators, teens, parents, counselors];

export function getGuidePage(path: string): GuidePage {
  const page = guidePages.find((item) => item.path === path);
  if (!page) throw new Error(`Missing guide page for ${path}`);
  return page;
}

export function guideSeoPages(): SeoPage[] {
  return guidePages.map((page) => ({
    path: page.path,
    slug: page.slug,
    phase: "landing",
    title: page.title,
    description: page.description,
    h1: page.h1,
    eyebrow: page.eyebrow,
    intro: page.intro,
    sections: page.sections.map((section) => ({
      heading: section.heading,
      body: section.paragraphs[0] ?? "",
      bullets: section.bullets,
    })),
    faqs: page.faqs,
    related: page.related,
    priority: 0.8,
    changeFrequency: "monthly" as const,
    lastModified: page.lastModified,
  }));
}
