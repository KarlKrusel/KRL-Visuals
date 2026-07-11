# KRL // VFX

Self-contained DJ visual engine. One file, no internet, no installs — built to run all night on a laptop in a closet.

## Run it
Double-click **`index.html`** (or drag it into Chrome/Edge/Safari/Firefox). Press **`F`** for fullscreen. That's it — it auto-runs and loops forever.

Tip: plug the laptop into the screen/projector, open the file, hit `F`, and walk away.

## Phone remote (control it from your pocket)
Run the tiny bundled server so a phone on the **same Wi-Fi** can drive the visuals. Still local-only — no cloud, no account, no internet, and (like the rest of this project) **no `npm install`** — it's plain Node.

**On the laptop:**
```
node server.js
```
It prints the URLs, e.g.:
```
Visuals (this computer):  http://127.0.0.1:8123/index.html
Phone remote (same Wi-Fi): http://192.168.1.42:8123/remote.html
```
1. Open the **Visuals** URL on the laptop (hit `F` for fullscreen).
2. Open the **Phone remote** URL on your phone's browser — that IP is your laptop's LAN address, so the format is always `http://<LAPTOP-IP>:8123/remote.html`.

If the printed IP doesn't work, find your laptop's LAN IP manually (macOS: `ipconfig getifaddr en0`; Windows: `ipconfig`) and use `http://THAT-IP:8123/remote.html`. Both devices must be on the same network, and a firewall prompt may ask to allow Node to accept incoming connections — allow it.

The remote gives you big touch buttons for: prev/next scene, scene dropdown + **scene lock**, prev/next colorway + colorway dropdown, **KRL / Woods logo locks**, logo **swap**, **mic** mode, **hide/show UI**, and the **goodbye message** — plus a live status card (current scene, colorway, active logo, look, FPS, render scale). It talks to the visuals over a local Server-Sent-Events message bus in `server.js`; the keyboard shortcuts and on-screen menu keep working exactly as before.

### Effects (live performance hits)
The remote's top **Effects** section — and a matching **Effects** row in the on-screen Visuals menu (`V`) — give you global hits that work over *any* scene or colorway without changing your loop:

- **WHITE STROBE** — toggles a pulsing white-glow overlay in the final composite (so every scene *and* the logo get it). It's hard-capped at ~50% toward white, so it reads as a lighting hit, not a room-blinding washout. Auto-stops after 45s as a safety in case the phone drops off Wi-Fi.
- **1× / 0.5×** — strobe speed. `1×` is normal, `0.5×` is half-speed.
- **DROP VELOCITY** — a momentary motion surge for a drop. It ramps in fast (~0.16s) and eases back over ~2.6s (smootherstep), briefly speeding up scene motion and lifting intensity. It's a one-shot trigger — it never permanently changes your selected scene speed.
- **COLOR HIT** — an abrupt colour snap for a hit. It rotates the hue of the *final* image (all scenes + logo) with a fast attack / ~120ms hold / smooth release. Because the rotation is around the grey axis, **blacks stay black and whites stay white** — it never washes the screen out. It's temporary and does not change your saved colorway.
- **COLOR STROBE** — toggles a rapid alternate between the normal colorway and the hit colour. `0.5× / 1× / 2×` set the rate. Auto-stops after 45s as a safety.
- **Hit intensity** — a 0–100% slider for how far COLOR HIT / COLOR STROBE push toward the hit colour.

All of these are computed in a couple of cheap ALU ops in the existing composite shader (no extra passes, no per-scene work), so they hold 60fps even at `2×`.

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
