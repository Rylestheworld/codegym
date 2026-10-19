# CodeGym Security

CodeGym is a public static learning prototype. It has no accounts, backend, database, privileged API keys, or shared leaderboard. Browser progress is personal, editable data. It is not authorization or a trusted competitive score. Do not enter credentials or confidential production data in exercises, notes, or progress files.

## Runtime Boundary

The main page loads fixed local runtime assets. It creates runner-frame.html with sandbox="allow-scripts" and without allow-same-origin. The bridge refuses to start unless its origin is opaque and its parent is separate; it accepts initialization only from its parent window and the site's URL origin. Learner code executes in a disposable blob worker created by that frame. The frame CSP permits blob resources only, with no HTTP or WebSocket connections. The main page has no dynamic-evaluation permission and cannot create workers directly. Runtime assets are passed into the isolated environment, not fetched by learner code from the site.

Every submission uses a fresh frame/worker, a 45-second initialization deadline, a three-second execution deadline, and a 50,000-character input limit. Removal terminates the runner. Imports have a 5 MB limit and reconstruct known fields; untrusted text is escaped or rendered with textContent. Results are source-checked and normalized before display. These controls do not impose a hard browser memory quota or make locally supplied results trustworthy. Resource exhaustion and browser/OS vulnerabilities remain limitations. Do not use this runner as a multi-user server execution service.

## Automated Checks

- `python3 scripts/security_check.py`: vendor hashes, generated frame CSP, sandbox/message invariants, local script allowlist, symlink rejection, and immutable GitHub Action revisions.
- `python3 scripts/install_semgrep.py .security-tools/semgrep`, then `python3 scripts/scan_source.py .security-tools/semgrep/bin/semgrep-core`: focused native SAST for untrusted HTML, dynamic evaluation, wildcard messaging, unsafe shell execution, and disabled TLS checks. The installer verifies the upstream wheel hash and extracts only the native engine and bundled libraries; it does not install Semgrep's Python dependency tree.
- `python3 scripts/install_gitleaks.py .security-tools/gitleaks`, then `.security-tools/gitleaks/gitleaks git --redact --no-banner --log-opts=--all .` and `.security-tools/gitleaks/gitleaks dir --redact --no-banner .`: repository history and working-tree secret checks.
- `python3 scripts/scan_dependencies.py`: fail-closed OSV queries for Pyodide, the native Semgrep release identity, and locked npm development packages. It fails on reported advisories or unavailable/malformed responses. It does not cover CPython core, native transitive libraries, browser/OS vulnerabilities, or every advisory database. Vendor checksums verify integrity, not absence of vulnerabilities.
- `node tests/browser-security.cjs`: browser-enforced isolation, denied egress/storage, message spoofing, XSS fixtures, and page CSP. Browser regression suites additionally cover learning and Proving Grounds behavior.

The Pages workflow runs checks on pushes and pull requests and deploys only after successful gates on main. Scanners have read-only repository permissions; only the deployment job gets Pages and OIDC write permissions. Checkout does not persist credentials. CI and local rules must remain reviewable.

Two SAST exceptions are intentional and reported: dynamic evaluation in code-worker.js (the learner evaluator), and wildcard targetOrigin in code-runner.js (required to address an opaque-origin frame). Message recipients validate source/origin; browser tests verify the boundary. No other files receive these exceptions.

## Local Developer Checks

Install the two native tools using the commands above, then enable the optional local commit hook with `git config core.hooksPath security/hooks`. The hook runs structural checks, SAST, and staged secret scanning. CI is authoritative for the full dependency/history gates. VS Code tasks provide the same structural check and SAST on demand. Do not commit .security-tools or secrets. On macOS the native scanner may require SSL_CERT_FILE to point to the system's trusted PEM bundle; never disable certificate validation.

For dependencies and runtime upgrades, verify upstream provenance, refresh checksums/licenses, rerun advisory queries and browser tests, and review upstream security notes. OSV's package lookup does not assess the embedded CPython security posture. No release is automatically upgraded merely because it is newer.

## Hosting and Reporting

GitHub secret scanning and push protection were confirmed enabled on 2026-10-19. The site uses a CSP meta tag because this GitHub Pages deployment does not configure custom response headers. Meta CSP cannot enforce frame-ancestors; stronger hosting-level headers require a hosting configuration change. No client-side password screen would make this public site private.

Report suspected vulnerabilities privately to the repository owner rather than posting working exploits or secrets in public issues. If credentials are ever exposed, revoke/rotate them first; deleting a file does not remove Git history. Future private testing, accounts, shared rankings, or cloud integrations require a new threat model and server-side controls before launch.
