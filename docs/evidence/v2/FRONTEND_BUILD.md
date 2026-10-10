# Frontend build remediation — 2026-10-10

Production build now passes using `npm run build` outside the Windows sandbox.
Vite 7.3.7: 476 modules transformed, completed in 3.65 seconds.

The debugger captured repeated Rollup `includeCallArgumentsOfPossibleValue`,
`includeCallArgumentsOfPossibleValues` and `includeCallArgumentsWhenCalledAtPath`
frames during call-argument tree-shaking. Node was CPU-active and using about
2.4 GB RAM. This was not an established CSS/font or network wait.

`frontend/vite.config.js` disables Rollup tree-shaking for this dependency graph.
This retains dependency code rather than changing contract or transaction logic.
Windows path resolution preserves symlinks to avoid `net use` discovery; this
checkout uses regular npm directories. Plain CSS uses explicit empty PostCSS
plugins. Optional Google fonts load from an HTML stylesheet link in the browser,
not a CSS import during build.

Output:

- HTML: 0.91 kB (gzip 0.49 kB).
- CSS: 7.43 kB (gzip 2.30 kB).
- Main JS: 920.61 kB (gzip 256.49 kB).
- Native helper chunk: 0.32 kB (gzip 0.17 kB).

Known trade-off: Vite warns that the main chunk exceeds 500 kB. This is a
successful build, not proof of browser wallet E2E or live settlement. Windows
sandbox child-process `spawn EPERM` still requires an approved outside-sandbox
build in this environment; no global Codex settings were changed.

No Cloudflare deploy or live contract transaction was performed as part of this
build repair. Existing V2 release gates remain open.
