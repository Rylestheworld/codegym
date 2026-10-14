# Bundled Python Runtime

Unmodified Pyodide 0.29.4 core files, downloaded from https://cdn.jsdelivr.net/pyodide/v0.29.4/full/. The runtime embeds CPython 3.13.2. manifest.json records file sizes and SHA-256 checksums. Optional packages listed in pyodide-lock.json are not bundled or requested by CodeGym.

Pyodide source and build instructions: https://github.com/pyodide/pyodide/tree/0.29.4. Pyodide uses MPL-2.0; see LICENSE.pyodide. CPython’s license is in LICENSE.python, also available from https://github.com/python/cpython/blob/v3.13.2/LICENSE. No modifications were made to these vendor files.

CodeGym loads these assets from the local site in a fresh worker per Python submission. No CDN request is necessary during normal use. Serve over HTTP for worker loading.
