# Known Limitations

## Deferred 3D Bundle

The desktop physics scene remains a large optional download because it contains Three.js and Rapier. It is isolated in a dynamic chunk and is not preloaded by the initial document. Small screens, coarse pointers, reduced-motion users, data-saver or low-resource devices, and WebGL fallback users remain on the static badge and do not request this chunk.

## Automated LinkedIn Check

The LinkedIn profile URL resolves correctly but returns LinkedIn's automated-request block to headless validation. GitHub profile and repository links returned HTTP 200 during validation.

## Headless Rendering

Rendered checks use installed Microsoft Edge in headless mode with software WebGL. Real GPU lighting and antialiasing can differ slightly, although the canvas pixel and drag checks confirm a nonblank interactive scene.
