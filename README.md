# KRL // VFX

Self-contained DJ visual engine. One file, no internet, no installs — built to run all night on a laptop in a closet.

## Run it
Double-click **`index.html`** (or drag it into Chrome/Edge/Safari/Firefox). Press **`F`** for fullscreen. That's it — it auto-runs and loops forever.

Tip: plug the laptop into the screen/projector, open the file, hit `F`, and walk away.

## Your logo
The engine flips between a **white-glow "KRL"** (rendered in `Tourner.ttf`) and the **`logo.png`** (currently the Grand Woods Lounge logo).

- Swap the PNG: replace **`logo.png`** in this folder (transparent background, ~2000px wide works great).
- Swap the font: replace **`Tourner.ttf`** (keep that filename).
- Change the text itself: open `index.html` and edit the `id="frostText"` element (`<div class="frostText" id="frostText" data-text="KRL">KRL</div>` — change both the `data-text` and the inner text).
- Both `logo.png` and `Tourner.ttf` must sit next to `index.html`. If either is missing it falls back gracefully.

## Controls (optional — it runs fine untouched)
| Key | Does |
|-----|------|
| `F` | Fullscreen |
| `Space` | Next scene |
| `C` | Next colorway |
| `X` | **Cycle visual style (Look)** |
| `V` | Open the Visuals menu (pick a style, curate the loop) |
| `L` | Flip logo (text ⇄ PNG) now |
| `G` | Glitch burst |
| `M` | Mic-reactive on/off (needs the localhost server — see below) |
| `S` | Toggle grit (grain/scanlines) |
| `A` | Auto-cycle on/off |
| `1`–`0` | Jump to the first 10 scenes directly |
| `H` | Hide/show the help bar |

## Styles (Looks)
Press **`X`** (or use the **Style** row in the Visuals menu) to switch between six looks. Each one re-grades *every* scene and curates which scenes autoplay:

- **FLOW** — soft, flowing, dreamy neon (the smooth stuff).
- **KINETIC** — sharp, punchy, fast cuts, light outline (James Hype).
- **MINIMAL** — near-black, hypnotic, posterized, slow (Mau P techno).
- **RAVE** — saturated, bloomy, energetic, strobe on peaks (festival).
- **GRIT** — gritty, glitchy, heavy RGB split + scanlines (Skrillex).
- **INK** — graphic line-art: strong outline + posterize, low colour.

Looks are defined in the `LOOKS` array in `index.html` (each is a bundle of post-processing settings + scene set + colour family) — that's where to tune them.

## What it does
- **14 scenes** that crossfade into each other (no hard cuts).
- **14 colorways** (4-stop gradients) that slowly tween throughout the night; each Look pins a cohesive subset.
- Sharpening/grading post-stack: unsharp, edge/outline, posterize, black-crush, contrast, bloom, chromatic aberration, vignette, grain.
- Optional **mic-reactive** mode (key `M`). On `file://` it bounces to a localhost server so the browser will grant mic access.
