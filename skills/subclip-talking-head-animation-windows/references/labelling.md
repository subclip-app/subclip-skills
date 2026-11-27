# Labelling the face tiles

You are the gaze detector. Each tile is one moment (every 0.5 s). Give each tile one label.

## 1. Calibrate first

Skim every sheet before you label anything. Then write two lines at the top of your labels:

- **Lens look:** what this speaker looks like on the lens. Face square to the camera, both irises centred in the eye opening, about the same white on each side, no white below the iris.
- **Screen direction:** where the eyes keep going when they leave the lens (left, right, up, down, up right). It differs between setups: a script window beside the camera pushes the irises sideways, a screen above the camera raises them and shows white below, a screen below lowers the eyelids.

Tile left and right are image left and right. Say "image left" in your notes to avoid confusion with the speaker's own left.

## 2. Labels

- `camera`: eyes on the lens. The head may be slightly turned if the irises point back at the lens. A hand gesture toward the camera is still `camera`.
- `screen`: reading (a script, notes, or a stream's chat). Eyes toward the screen direction from step 1, even with a frontal head. Signs: irises pushed to one side; irises raised with white showing below; eyelids lowered toward a screen below the lens.
- `away`: head turned far off (profile), head tilted back, face covered (hand, towel, cup), looking around the room, face out of the frame. A tile with a `NO FACE` badge is often `away`; check it rather than assume.
- `unclear`: you cannot tell. Before you leave a tile unclear, render a zoom sheet on it.

Judge the eyes, not the head. A frontal head with eyes on the screen is `screen`; a turned head with irises on the lens is `camera`.

## 3. Zoom on doubt

`get_media_contact_sheet` on the same target with `times` set to the doubtful tile and the quarter steps around it (for example 12.25, 12.5, 12.75), `faceCrop: {scale: 1.1}`, `tileSize: 480`, `columns: 3`. A zoom check at a time that is not on the 0.5 s grid (for example `62.75 camera`) is allowed: it adds an extra point and sharpens a window edge (see window-rules.md, step 0).

Zoom every frontal face that might be a slightly raised look. That is the main failure case.

## 4. Write ranges

One line per range, by tile time, inclusive:

```
# lens look: frontal, irises centred, no white below
# screen: image right and slightly up (script window right of the camera)
0-55.5    screen   # head toward the screen, eyes image right
56-58.5   camera   # lens look; 58-58.5 waves a hand at the camera: still camera
59-60.5   screen
61-62     away     # turned to profile
62.5      camera   # zoom check: short lens look between two reading stretches
63-88     screen
```

Tiles you do not list count as `unclear`.

More examples from the test clips:

```
11-12     screen   # head frontal but irises raised, white below: the screen is above the lens
12.5-17.5 away     # wiping the face with a towel
```

## 5. Self check

- Every tile has a label, and every look-away run has a reason you can name.
- Count the camera tiles. A take of reading off a screen with more than half camera tiles, or none at all, is worth a second look at your calibration.
