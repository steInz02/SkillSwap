# Put SkillSwap on your GitHub

1. Extract the project and open it in VS Code.
2. Run it locally using the README and try the demo and live modes.
3. Open **Source Control** in VS Code and choose **Initialize Repository**.
4. Review the files. `.gitignore` excludes dependencies, local databases, runtime files, credentials, and builds.
5. Enter `Build SkillSwap skill-exchange MVP` as the commit message and commit.
6. Choose **Publish to GitHub**, sign in yourself, and name the repository `skillswap`.
7. Choose public or private according to your preference. No GitHub repository was created automatically for you.

Suggested repository description:

> A peer-to-peer skill-exchange platform with matching, learning proposals, two-party completion, and participant reviews. Built with React, TypeScript, and Cloudflare D1.

Suggested topics: `react`, `typescript`, `skill-sharing`, `education`, `cloudflare-workers`, `sqlite`, `full-stack`.

The `.openai/hosting.json` file in the source records the private preview’s Site identity. It is not a secret, but do not copy its `project_id` when provisioning a different Site. Local development uses its `d1: "DB"` declaration. Keep `.wrangler/` and all `.env` files out of your repository.

GitHub stores your code. GitHub Pages is static-only and cannot host this full app’s API and D1 database. The included private preview is useful for reviewing the result; a public deployment must be explicitly configured separately.

## Short project explanation for your portfolio

SkillSwap helps learners exchange knowledge without payments. A user lists what they can teach and what they want to learn. Compatible partners propose a session, agree to the exchange, and both confirm completion before reviews are allowed. The project demonstrates relational data modeling, authenticated APIs, role-based actions within a transaction, responsive UI, and automated testing.
