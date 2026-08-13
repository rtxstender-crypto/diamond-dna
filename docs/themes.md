# Themes

Light is the default for first-time visitors. `components/theme-toggle.tsx` stores `light` or `dark` under the versioned `diamonddna-theme-v1` key. A parser-time script in the root layout applies the saved value before paint; the client toggle reapplies it during development hydration.

Both themes share layout and components. Semantic CSS tokens cover page, surface, elevated surface, primary/secondary/muted text, borders, accent, positive, negative, warning, inputs, hover, selected state, and elevation. Dark mode translates the current editorial design and does not restore the former black/neon visual system.
