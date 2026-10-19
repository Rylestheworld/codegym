# Security Review — 2026-10-19

Scope: first-party browser code, progress imports, worker execution, bundled Python runtime, static build/deployment, tracked Git history, and development security tools. This is a targeted engineering audit, not an independent penetration test or an OWASP certification. Severity below is qualitative; no numerical CVSS score is claimed.

## Findings and Changes

| Finding | Assessment | Resolution |
|---|---|---|
| Learner code ran in a same-origin worker with network/storage capabilities | Medium; intentional code execution lacked adequate separation (CWE-653) | Opaque-origin iframe sandbox, blob worker with restrictive inherited CSP, fixed asset provisioning, strict bridge source/origin checks, direct/unsandboxed bridge refusal, deadlines and submission-size cap |
| No main-page CSP | Defense-in-depth gap (CWE-693) | Main page now permits only local app scripts and explicitly blocks evaluation, direct workers, objects, form submission, and base-URL replacement |
| Runtime-result HTML construction | Potentially fragile rendering boundary (CWE-79); no working imported-XSS exploit reproduced | Test results now use DOM nodes/textContent; imported notes/drafts are still escaped; adversarial payload tests added |
| Old bundled runtime and no enforced provenance check | Maintenance/supply-chain gap | Pyodide upgraded from 0.29.4 / CPython 3.13.2 to upstream Pyodide 314.0.7 / embedded CPython 3.14.2; upstream archive digest checked, file hashes and matching licenses recorded and build-enforced |
| Mutable action tags and no security deployment gates | Supply-chain/process gap | Immutable action SHAs, read-only scan jobs, no persisted checkout credentials, SAST/SCA/secret/browser gates before deployment |
| Optional Python dependency in initially evaluated Semgrep installation had GHSA-84m7-p3x7-pcfv (mcp 1.29.0) | Development tooling finding, not browser-app dependency | Project tooling extracts only the checksum-verified native Semgrep engine and bundled libraries. The Python CLI/MCP dependency tree is not installed by project scripts or CI |
| Arbitrary asset symlinks could enter build | Build hardening (CWE-22) | Script basename allowlist, symlink rejection, and resolved-path containment before publication |

## Verification and Coverage

Gitleaks scans of repository history and working files returned no leaks. GitHub API confirmed secret scanning and push protection already enabled. OSV queries of the final package inventory returned no advisories at review time. Focused native Semgrep checks returned no unreviewed findings; isolated evaluation and opaque-frame messaging are explicit exceptions reported by the scanner wrapper.

Browser tests exercise JS and Python isolation, cross-origin and same-origin HTTP denial, WebSocket and script-import denial, inaccessible app storage, forged/malformed messages, repeated readiness messages that previously could reset a deadline, imported markup, input limits, and main-page CSP. Learning/writing/mission regressions cover ordinary operation and timeouts. CI repeats these checks on the built site. Test fixtures intentionally contain attack strings and must not be copied into application flows.

No SQL backend, password database, API secrets, cloud role policies, or shared leaderboard exist in this app. SQL injection, password hashing, RBAC enforcement, database grants, and secret-vault integration therefore have no current implementation to repair. Future backend work must follow AGENTS.md and receive a new threat-model review.

## Remaining Limits

- OSV ecosystem queries do not cover embedded CPython core, every native scanner library, or browser/OS vulnerabilities. The current Pyodide release still embeds an older CPython patch. It must not be described as fully patched merely because the Pyodide release is newer; upstream security review and maintenance remain necessary.
- Browser execution has time limits but no enforceable per-submission memory quota. Browser bugs and resource exhaustion remain possible.
- All answers, tests, and local scores are inspectable/editable. They cannot support trusted competitive rankings or access controls.
- GitHub Pages meta CSP cannot enforce frame-ancestors or replace hosting-level response headers. Full anti-framing headers require a hosting change.
- SAST uses five focused rules and manual review, not exhaustive interprocedural verification. No scanner result proves absence of vulnerabilities.
- The site and repository remain public as authorized. An organization's approval of external hosting or use of internal data is outside this code audit; no internal data was added.
