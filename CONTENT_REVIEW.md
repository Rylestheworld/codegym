# Content and Grading Review

This iteration reviews wording, code assumptions, accepted aliases, difficulty progression, and the new teaching examples. The automated suite checks application behavior and authored test expectations; it is not an independent expert certification of all subject matter.

## Corrections

- Replaced whitespace deletion with token-aware blank grading. `le t` is not `let`; `n * * 2` is not `n ** 2`; quoted string contents retain their spaces and case.
- Command fragments preserve word boundaries: `- p` is not `-p`. Accepted CLI aliases are explicit.
- SQL and assembly fold unquoted identifiers/keywords appropriately; string literals retain case. Other programming-language identifiers remain case-sensitive.
- Multiple-choice grading compares the selected authored answer exactly rather than rewriting it.
- Reworded Go’s comma-ok exercise to test `ok` in a condition, rather than insisting an arbitrarily chosen variable name is the only correct declaration.
- Added legitimate aliases for R assignment and `base::c`, Python squaring, C null-character initialization, a parenthesized JavaScript comparator, and HTML tag/attribute capitalization.
- Every question has a reference link, sometimes to a general topic guide rather than a precise supporting section. These links include standards drafts and third-party references; their presence is not evidence of individual answer verification. The UI provides a local ambiguity report that is included in progress exports.
- Transfer examples specify relevant language/ABI/context assumptions and use a separate example from the quick-rep bank. The Terraform secret example uses valid multiline HCL.

## Scope and Assumptions

The bank retains 25 questions per topic across five relative difficulty tiers. Expert means harder reasoning within this compact curriculum; placement and badges do not certify professional expertise. Question snippets can be fragments rather than complete programs. The lesson explains the governing rule, including when a supplied example intentionally demonstrates invalid code.

SQL uses PostgreSQL. Assembly uses x86-64 Intel syntax and System V AMD64, with Linux syscall questions stated explicitly. Swift uses Swift 6 assumptions, Kotlin uses Kotlin/JVM with kotlinx.coroutines, Go uses Go 1.22+ language semantics, and VHDL uses VHDL-2008 and the stated IEEE packages. KQL is Microsoft Kusto, not Kibana.

The local mission query runner intentionally supports only a small documented KQL subset. It evaluates the supplied fictional rows; it is not an Azure connection or a full Kusto engine. Written JavaScript and Python exercises execute in disposable browser workers with time limits; authored tests accept different implementations that meet the cases. Reasoning/debrief text is saved for self-review and is not falsely labeled automatically correct.

## Learning Rules

Practiced records completed unaided quick-rep practice. Retained is measured per topic tier after two successful delayed checks on separate scheduled dates. Each check requires a separate transfer example and two tier answers, all correct and confident without help. Initial intervals are 3, 7, 21, then 30 days; a failed or uncertain check is due tomorrow. This is a practical starting policy, not a claim that this exact spacing is optimal for every learner.

Old progress is migrated as practice history, never automatically as retention. Earned unlocks remain open. Placement is a provisional start recommendation; it earns neither practice credit nor retention credit and schedules follow-up checks for skipped tiers.
