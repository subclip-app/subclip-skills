# Window rules: labels to windows

These rules give the same result as `make_windows.py` from issue #298 (defaults: merge gap 1.0 s, blip 1.0 s, minimum length 2.0 s, maximum length 5.0 s, snap distance 0.75 s). Apply them in order. Work in seconds and round the final numbers to two decimals.

Inputs: the tile times `t` (every `s = 0.5` s from 0), the clip duration `D`, your labels, and optionally the words from `get_script`.

## Step 0: points and spans

- The points are the tile times plus any zoom check time you labelled that is not a tile (for example 62.75). Sort them.
- Each point `i` owns a span `[L_i, R_i]`:
  - `L_i` is halfway to the previous point; for the first point it is `max(0, t_0 - s/2)`.
  - `R_i` is halfway to the next point; for the last point it is `min(D, t_last + s/2)`.
- On a plain 0.5 s grid every span is `[t - 0.25, t + 0.25]`, clipped to `[0, D]`.

## Step 1: resolve unclear points

For each `unclear` point, look at its two direct neighbours (`i - 1` and `i + 1`) and ignore those that are also unclear.

- If at least one neighbour is left and all of them are `screen` or `away`, the point takes the label of the first of them (the left one if it counts).
- Otherwise it becomes `camera`. Never hide the face on a guess.

Use the original labels of the neighbours, not labels you already resolved.

## Step 2: camera zones

Every `camera` point makes a zone `[max(L_i, t - 0.25), min(R_i, t + 0.25)]`. On a 0.5 s grid this is the point's own span. No window may grow or snap into a camera zone (steps 5 and 6). Merging in step 3 is the one exception.

## Step 3: stretches and merging

- A run of consecutive `screen` / `away` points is a stretch from `L` of its first point to `R` of its last point.
- Walk the stretches left to right. If the gap between the end of the previous one and the start of the next is **less than 1.0 s** (strictly), merge them into one stretch.
- On a 0.5 s grid: one camera tile between two look-aways (gap 0.5 s) is merged over; two or more camera tiles (gap 1.0 s or more) are kept as face time.

## Step 4: drop blips

Drop every stretch shorter than 1.0 s. A stretch of exactly 1.0 s (two tiles) stays.

## Step 5: grow short stretches toward 2.0 s

For a stretch shorter than 2.0 s, grow it outward in small equal steps on both sides at once:

- The start may move left only while it stays at or after the end of the previous stretch (or 0) and does not enter a camera zone.
- The end may move right only while it stays at or before the start of the next stretch (or `D`) and does not enter a camera zone.
- If one side is blocked, the other side keeps growing alone. Stop at 2.0 s or when both sides are blocked.

In practice a stretch edge usually touches a camera zone (the tile before it was camera), so growth happens mostly at the very start or end of the clip, or next to frames you did not label as camera. A stretch that cannot reach 2.0 s stays short: use a quick cut or a short graphic there.

## Step 6: snap edges to phrase boundaries (with word timings)

Phrase boundaries are:

- 0 and `D`;
- the midpoint of every gap of 0.2 s or more between two words;
- the midpoint between a word that ends with `. ! ? , ; :` and the next word;
- 0.1 s before the first word and 0.1 s after the last word.

For each stretch, in order:

1. New start: the boundary nearest to the start, at most 0.75 s away, not before the end of the previous stretch, not later than `end - 1.0`, and with no camera zone between the old and the new position. If none qualifies, keep the start.
2. New end: the boundary nearest to the end, at most 0.75 s away, not before `new start + 1.0`, not after the start of the next stretch, and with no camera zone between. If none qualifies, keep the end.

Because the tile before a stretch is usually camera, snapping usually moves an edge inward (later start, earlier end) into a pause.

## Step 7: cap at 5.0 s and chain

For a stretch of length `Len`:

- `n = ceil(Len / 5.0)` (a stretch of exactly 5.0 s gives `n = 1`).
- Equal cut points `c_k = start + Len * k / n` for `k = 0..n`.
- With word timings, move each inner cut `c_k` (`0 < k < n`) to the nearest phrase boundary within 0.75 s that lies between `c_(k-1) + 2.0` and `c_(k+1) - 2.0` and touches no camera zone. Keep the move only if the new piece `c_k - c_(k-1)` is at most 5.5 s.
- Each piece `[c_k, c_(k+1)]` is one window, back to back with the next.

## Step 8: reasons

For each window, take the look-away points whose time falls in `[start, end)`. The reason is `looking at screen` when most of them are `screen`, else `looking away`, followed by `(tiles A-Bs)` with the first and last of those times, and `, part k/n of a chain` when `n > 1`.

## Worked example (verified against make_windows.py)

Clip of 10 s, tiles every 0.5 s, no transcript:

```
0-1     camera
1.5-3   screen
3.5     camera
4-6.5   screen
7-7.5   camera
8-8.5   away
9-10    camera
```

- Stretches: `1.5-3` gives `[1.25, 3.25]`; `4-6.5` gives `[3.75, 6.75]`; `8-8.5` gives `[7.75, 8.75]`.
- Merge: `3.75 - 3.25 = 0.5 < 1.0`, so the first two merge into `[1.25, 6.75]` (the single camera tile at 3.5 s is merged over). `7.75 - 6.75 = 1.0`, not less than 1.0, so the third stays apart.
- Blips: `[7.75, 8.75]` is exactly 1.0 s and stays.
- Grow: `[7.75, 8.75]` needs 1.0 s more, but the camera zones `[7.25, 7.75]` and `[8.75, 9.25]` touch both edges. It stays 1.0 s.
- Chain: `[1.25, 6.75]` is 5.5 s, so `n = 2`, cut at 4.0.

```json
[{"start": 1.25, "end": 4.0, "reason": "looking at screen (tiles 1.5-3s), part 1/2 of a chain"},
 {"start": 4.0, "end": 6.75, "reason": "looking at screen (tiles 4-6.5s), part 2/2 of a chain"},
 {"start": 7.75, "end": 8.75, "reason": "looking away (tiles 8-8.5s)"}]
```

6.5 s of 10 s covered.

## Final checks

- List every camera run of two tiles or more. None of them may overlap a window.
- Every window is at least 1.0 s and at most 5.5 s; most are 2 to 5 s.
- Windows do not overlap each other; chained pieces touch end to start.
