# Thumbnail System Comparison: yylobby vs chobby (therxlobby)

## Chobby's Approach (Reference Implementation)

### Map Name Sanitization
```lua
mapName = string.gsub(mapName, "[^a-zA-Z0-9%-%(%)%.]", "_")
```
Replaces everything that is NOT `a-z`, `A-Z`, `0-9`, `-`, `(`, `)`, `.` with a single `_`.

### GetMinimapSmallImage (thumbnails for map lists)
1. Check local `.png` in `minimapThumbnailPath` (e.g. `LuaMenu/configs/gameConfig/zk/minimapThumbnail/{sanitized}.png`)
2. Check downloaded `.jpg` in `LuaMenu/Images/MinimapThumbnails/{sanitized}.jpg`
3. If neither exists, download from `https://zero-k.info/Resources/{sanitized}.thumbnail.jpg`

### GetMinimapImage (full minimaps for battle room)
1. Check local `.jpg` in `minimapOverridePath` (e.g. `LuaMenu/configs/gameConfig/zk/minimapOverride/{sanitized}.jpg`)
2. Check downloaded `.jpg` in `LuaMenu/Images/Minimaps/{sanitized}.jpg`
3. If neither exists, download from `https://zero-k.info/Resources/{sanitized}.minimap.jpg`

### Key details
- Sanitization is done once, and the same sanitized name is used for both local lookup and download URL
- Download URL uses exactly one format: `{sanitized}.thumbnail.jpg` (no fallback URLs)
- The sanitized name preserves `-`, `(`, `)`, `.` characters

---

## yylobby's Approach

### Map Name Sanitization (two different places!)

**For local file lookup** (`zk_launcher.ts:getMapThumbnailLookupKeys`):
```ts
const normalizedWhitespace = mapName.trim().replace(/\s+/g, ' ')
return Array.from(new Set([
    normalizedWhitespace.toLowerCase(),
    normalizedWhitespace.replace(/\s+/g, '_').toLowerCase(),
    normalizedWhitespace.replace(/[^\w.-]+/g, '_').toLowerCase(),
    normalizedWhitespace.replace(/\s+/g, '').toLowerCase()
]))
```
Generates multiple lookup key candidates (fuzzy matching).

**For download URLs** (`ZeroKDownloader.ts:getThumbnailUrlCandidates`):
```ts
const baseNames = Array.from(new Set([
    mapName.trim().replace(/\s+/g, '_'),
    mapName.trim().replace(/[^\w.-]+/g, '_'),
    mapName.trim().replace(/\s+/g, '')
]))
```
Tries multiple URL patterns with both `.jpg` and `.png` extensions.

**For saved file name** (`ZeroKDownloader.ts:getMapKey`):
```ts
return mapName.trim().replace(/\s+/g, '_').replace(/[^\w.-]+/g, '_')
```

### Local file lookup (`zk_launcher.ts:ensureMapThumbnailIndex`)
Scans 4 directories for `.png`, `.jpg`, `.jpeg`, `.dds` files:
1. `{basePath}/LuaMenu/configs/gameConfig/zk/minimapThumbnail/`
2. `{basePath}/LuaMenu/configs/gameConfig/zk/minimapOverride/`
3. `{basePath}/games/therxlobby.sdd/LuaMenu/configs/gameConfig/zk/minimapThumbnail/`
4. `{basePath}/games/therxlobby.sdd/LuaMenu/configs/gameConfig/zk/minimapOverride/`

Index keys are stored as lowercase basename (without extension).

### Download flow
Downloads save to `{basePath}/LuaMenu/configs/gameConfig/zk/minimapThumbnail/{mapKey}.jpg`

---

## Differences and Potential Issues

### 1. Sanitization mismatch (IMPORTANT)
Chobby's regex: `[^a-zA-Z0-9%-%(%)%.]` -> replace with `_`
- Preserves: letters, digits, `-`, `(`, `)`, `.`
- Replaces: spaces, underscores(!), and everything else

yylobby's regex: `[^\w.-]+` -> replace with `_`
- `\w` = `[a-zA-Z0-9_]`, so this preserves underscores
- Preserves: letters, digits, `_`, `.`, `-`
- Replaces: `(`, `)`, spaces, and everything else

**The key difference**: Chobby preserves `(` and `)` but replaces `_` with `_` (no-op for existing underscores but relevant for the regex). yylobby preserves `_` but replaces `(` and `)`.

Example with map name `"Stronghold(s) v3"`:
- Chobby: `Stronghold(s)_v3`
- yylobby: `Stronghold_s__v3` (parentheses become underscores, and `+` flag collapses them)

Wait, yylobby uses `+` (one or more), so `(s)` -> `_s_` since `(` and `)` are each replaced. Actually with `[^\w.-]+` it replaces consecutive non-word chars, so `(` alone -> `_`, `)` alone -> `_`, giving `Stronghold_s__v3`. No - since `\s` between `(s)` and `v3` is a space, `") "` is a consecutive group of non-`\w.-` chars -> single `_`. Let me re-check:

`"Stronghold(s) v3"`:
- yylobby `replace(/[^\w.-]+/g, '_')`: The `(` is non-word -> `_`, `s` is word (kept), `) ` is two non-word chars -> `_`, result: `Stronghold_s_v3`
- Chobby: each char checked individually, `(` kept, `s` kept, `)` kept, ` ` -> `_`, result: `Stronghold(s)_v3`

So the download URL would be different:
- Chobby downloads: `Stronghold(s)_v3.thumbnail.jpg`
- yylobby downloads: `Stronghold_s_v3.thumbnail.jpg`

**This means yylobby could fail to download thumbnails for maps with parentheses in their names**, since the zero-k.info server likely uses chobby's naming convention.

### 2. Download target directory difference (minor)
- Chobby downloads thumbnails to: `LuaMenu/Images/MinimapThumbnails/`
- yylobby downloads thumbnails to: `LuaMenu/configs/gameConfig/zk/minimapThumbnail/`

This is actually fine - yylobby saves directly into the local thumbnail dir so it's found immediately on next lookup. Chobby uses a separate download dir. Both approaches work.

### 3. Case sensitivity in lookup
- yylobby lowercases all lookup keys and index keys - good, avoids case mismatch issues
- Chobby doesn't lowercase (Lua string.gsub is case-sensitive) but Spring VFS may handle this

### 4. yylobby doesn't have separate "full minimap" vs "thumbnail" concept
- Chobby has `GetMinimapSmallImage` (thumbnail) and `GetMinimapImage` (full minimap) with different source URLs (`.thumbnail.jpg` vs `.minimap.jpg`)
- yylobby only downloads `.thumbnail.jpg` (and tries `.thumbnail.png` as fallback)
- This is fine if yylobby only needs small thumbnails, but if a larger minimap is ever needed, the infrastructure isn't there

### 5. URL case sensitivity
- Chobby sends the sanitized name as-is (preserving original case) in URLs
- yylobby also preserves case in URLs (only lowercases for local lookup)
- Both should match zero-k.info's expectations

### 6. Multiple URL candidates (yylobby advantage)
yylobby tries up to 6 URL variations (3 name formats x 2 extensions), while chobby only tries one URL. This gives yylobby better resilience for edge cases but could also cause unnecessary 404 requests.

---

## Summary

The main correctness issue is the **parentheses handling in sanitization**. Maps with `(` or `)` in their names will generate different filenames in yylobby vs chobby, which means:
1. yylobby won't find thumbnails that chobby/therxlobby already downloaded (if the files have parentheses in their names)
2. yylobby's download URLs may not match what zero-k.info expects for these maps

**Recommended fix**: Change yylobby's sanitization to match chobby's behavior - preserve `(` and `)` characters. The regex `[^\w.()-]+` or equivalent would do this (add parentheses to the allowed set in `\w.-`). This needs to be updated in:
- `ZeroKDownloader.ts:getThumbnailUrlCandidates`
- `ZeroKDownloader.ts:getMapKey`
- `zk_launcher.ts:getMapThumbnailLookupKeys`

Everything else looks correct and functional.
