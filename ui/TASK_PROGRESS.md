# Task Progress

- [x] Add a shared preview-screen primitive to the UI component library so iframe previews stop being bespoke markup.
- [x] Update the theme preview surface to consume the shared preview-screen component instead of a hand-written iframe block.
- [x] Document the new preview-screen primitive in the canonical UI docs.
- [x] Tighten the builder shell so the tabs sit directly under the blue header and sidebar detail panes stop stacking outer padding.
- [x] Remove duplicate workspace detail headers for builder presets by letting the shell own the detail header and stripping the embedded preset page heading.
- [x] Note for future agents: the targeted `#/builder/forms` regression is green, but the broad `tests/theme-surfaces.test.js` suite still has unrelated pre-existing failures and is not a clean all-green signal for that fix.
