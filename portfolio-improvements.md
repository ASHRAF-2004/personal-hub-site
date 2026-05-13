# Portfolio Improvements

## Completed In This Correction

- Removed the visible framed badge container.
- Made the 3D badge larger and more prominent in the hero.
- Moved the badge into open hero space instead of a boxed panel.
- Restored the sandbox-like camera and hanging setup more closely.
- Kept Rapier rope joints, spherical joint, physics dragging, and MeshLine rendering.
- Replaced the plain white lanyard with a textured strap.
- Added a brand-neutral strap texture so the lanyard reads closer to the sandbox without displaying Vercel branding.
- Aligned the card visual with the lanyard attachment point so the strap appears attached to the holder.
- Preserved the image-only card rule.
- Preserved all existing portfolio content and links.

## Suggested Next Improvements

- Replace the generated neutral strap texture with a custom real lanyard texture that belongs to this portfolio.
- Provide a higher-resolution portrait with transparent or black background for a cleaner badge texture.
- Consider tuning the badge on a visible browser/GPU window after review, since headless Edge can render WebGL slightly differently.
- Add a small smoke test script for project count, resume links, and hero canvas presence.
