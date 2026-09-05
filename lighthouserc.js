/**
 * Lighthouse CI configuration.
 *
 * Run with `pnpm quality:ci` (builds first, then starts the production server
 * on port 4321 and audits the live pages).
 *
 * Initial quality budget:
 *   Performance      >= 0.90
 *   Accessibility    >= 0.90
 *   Best Practices   >= 0.90
 *   SEO              >= 0.95
 */

const BASE_URL = "http://localhost:4321";

module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm start -p 4321",
      url: [
        `${BASE_URL}/`,
        `${BASE_URL}/validator`,
        `${BASE_URL}/minify`,
        `${BASE_URL}/repair`,
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--headless --no-sandbox",
        output: ["json", "html"],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        // This is a static, backend-free site — PWA/HTTP2 audits are irrelevant.
        "categories:pwa": "off",
        "uses-http2": "off",
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
