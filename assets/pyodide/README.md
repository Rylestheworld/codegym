# Bundled Python Runtime

Pyodide 314.0.7 core assets, including CPython 3.14.2, from the official release archive recorded in manifest.json. The archive SHA-256 was verified against upstream release metadata before extraction. Per-file checksums and licenses are retained and checked before building the site.

Only the core runtime is bundled. Packages listed in pyodide-lock.json are an upstream catalog, not installed dependencies. The runner has no network access and cannot download optional packages. The trusted main page passes the core bytes into an opaque-origin frame's worker.

The Pyodide release number does not imply that the embedded CPython is the newest security patch. OSV npm lookups do not cover CPython core; see SECURITY.md for the upgrade/review requirements and remaining limitations.
