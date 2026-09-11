# react-bits — reference source (NOT shipped)

These files are the **upstream [reactbits.dev](https://reactbits.dev) originals** that two of
this project's vanilla modules were ported from. They are kept here purely as reference — for
example, to pull in an upstream fix or re-check a shader — and are **never imported, bundled, or
served**. There is no React runtime in this project.

| Reference (`.jsx`)   | Live vanilla port                          |
| -------------------- | ------------------------------------------ |
| `Grainient.jsx`      | `assets/js/modules/grainient.js` (uses `assets/js/vendor/ogl.js`) |
| `StaggeredMenu.jsx`  | `assets/js/modules/staggeredMenu.js` + `assets/css/staggeredMenu.css` |

If you change behavior, edit the **vanilla port**, not the `.jsx` here. This folder lives under
`docs/` (not `assets/`) specifically so it never reads as shipped code.
