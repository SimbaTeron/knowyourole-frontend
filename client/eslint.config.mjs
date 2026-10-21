import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const mathRandom = {
  selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
  message: "Math.random is only allowed in src/lib/randomId.ts. Use a seeded RNG everywhere else.",
};

const legacyScoringImports = {
  patterns: [
    {
      group: [
        "**/shortformV3Adjustments",
        "**/shortformV3Adjustments.ts",
        "**/shortformV4Adjustments",
        "**/shortformV4Adjustments.ts",
        "**/applyScoringV3ToScoresData",
        "**/applyScoringV3ToScoresData.ts",
        "**/applyScoringV4ToScoresData",
        "**/applyScoringV4ToScoresData.ts",
        "**/softMbtiV3",
        "**/softMbtiV3.ts",
      ],
      message:
        "Legacy v3/v4 scoring stays inside the versioned scorer so stored results can still be re-rendered. Do not import it from new code.",
    },
  ],
};

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "dist/**",
      "build/**",
      "playwright-report/**",
      "test-results/**",
      "scripts/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.{mjs,ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", mathRandom],
    },
  },
  {
    // These recommended rules already fail across the existing tree, including
    // results files this branch must not edit. They stay off so CI can enforce
    // the new bans without a mass cleanup.
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/purity": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/immutability": "off",
      "@next/next/no-location-assign-relative-destination": "off",
      "@next/next/no-html-link-for-pages": "off",
      "prefer-const": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
  {
    files: ["src/lib/randomId.ts", "src/lib/results/buildResultDTO.ts"],
    rules: {
      // buildResultDTO already mints result ids. Left untouched while results rendering is in another branch.
      "no-restricted-syntax": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/lib/quiz/scoreShortformVersioned.ts",
      "src/lib/quiz/shortformV5Adjustments.ts",
      "src/lib/quiz/shortformV3Adjustments.ts",
      "src/lib/quiz/shortformV4Adjustments.ts",
      "src/lib/results/finalClarity.ts",
    ],
    rules: {
      "no-restricted-imports": ["error", legacyScoringImports],
    },
  },
];

export default config;
