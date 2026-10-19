# CodeGym Security and Contribution Rules

Treat generated code, imported progress, and learner submissions as untrusted. Review behavior and tests before merging; scanner success is not proof of security.

- Keep this app static and public unless the user explicitly changes its architecture. Do not imply that local achievements or hidden JavaScript are access controls.
- Never commit secrets or put them into browser assets. A future backend must use managed secrets, server-side authorization, secure sessions, rate limits, and parameterized database access. Require a threat-model review before adding accounts, leaderboards, uploads, or server execution.
- Learner code may execute only in the disposable opaque-origin sandbox worker. Never add allow-same-origin to the frame. Never relax the frame network policy or execute learner code on the page/server. Preserve message-source and origin checks and bounded execution/submission sizes.
- Render user/import/runtime text with textContent or the reviewed escapeHTML helper. Validate imports by reconstructing known fields. Do not inject imported URLs, markup, or event handlers.
- Use official upstream packages only. Pin tools/actions, verify artifact hashes, and record bundled runtime provenance/licenses. Do not install a package solely because an AI suggested its name. The native-only Semgrep installer intentionally excludes Python dependencies.
- Keep app assets in the explicit build allowlist. Reject symlinks and path traversal. Never publish distribution/, credentials, developer tools, or progress exports.
- Run python3 scripts/security_check.py, node verify-bank.cjs, native SAST, Gitleaks, and the OSV dependency check before publication. Sandbox/runtime/rendering changes also require tests/browser-security.cjs and relevant browser-learning/proving regressions.
- Reproduce and fix scanner findings. Any exception must be narrow, explained in SECURITY.md, and backed by tests. Do not suppress findings just to pass CI.
- Preserve prototype and self-reported achievement labels. Do not describe the site as fully secure, certified, or comprehensively audited.
