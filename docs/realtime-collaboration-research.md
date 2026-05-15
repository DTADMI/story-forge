# Real-time Collaboration Research

## Options

| Solution | Type | Pricing | Complexity | Bundle Size |
| --- | --- | --- | --- | --- |
| Yjs | CRDT library | Free / MIT | Medium | ~50 KB gzipped |
| TipTap Collaboration | Commercial add-on | $99+/month | Low | ~30 KB |
| Supabase Realtime | WebSocket broadcast | Free tier (2M messages) | Medium | Built into Supabase SDK |
| Liveblocks | Managed service | Free up to 5 users, then $15+/user | Low | ~40 KB |
| PartyKit | Edge WebSocket | Free tier, then usage-based | Medium | ~20 KB |

## Recommendation: Yjs + Supabase Realtime

Yjs handles CRDT conflict resolution. Supabase Realtime provides the WebSocket transport layer. Both are free, open-source, and already available in the StoryForge stack (Supabase).

### Architecture

```
Editor (TipTap) → Yjs Document (ydoc) → Yjs Awareness (cursors)
       ↓
Supabase Realtime Channel (Broadcast presence + document updates)
       ↓
Other Clients
```

- **Yjs Document**: The shared data structure. Each project has one `ydoc`.
- **Yjs Awareness**: Propagates cursor positions, user names, and selection state.
- **Supabase Realtime Broadcast**: Lightweight pub/sub for awareness and small document patches.

### Technical Challenges

| Challenge | Mitigation |
| --- | --- |
| Cursor sync latency | Awareness updates via Realtime Broadcast (not DB) |
| Undo/redo across clients | Yjs UndoManager per user, scoped to own changes |
| Offline support | Yjs IndexedDB persistence, re-sync on reconnect |
| Conflict resolution | Yjs CRDT merge is deterministic and automatic |
| Document size | Sync only deltas, not full documents |

### Implementation Phases

#### Phase 1 — Presence + Cursors (4 hours)

- Initialize Yjs `Awareness` in the editor
- Broadcast cursor positions via Supabase Realtime Broadcast
- Show remote user cursors and names in the editor viewport
- Feature flag: `real_time_collaboration`

#### Phase 2 — Real-time Text Sync (8 hours)

- Bind TipTap editor to Yjs (`y-prosemirror` / `@tiptap/extension-collaboration`)
- Sync document updates via Supabase Realtime
- Handle merge conflicts via Yjs built-in merge
- Add user join/leave notifications to the editor UI

#### Phase 3 — Offline Support (6 hours)

- Yjs IndexedDB persistence for offline edits
- Conflict-free merge on reconnect
- Sync indicator in the editor UI
- Draft-while-offline mode

### Estimated Total Effort

**12 hours** for Phase 1 + Phase 2 (presence, cursors, real-time text sync).

Phase 3 (offline) is an additional 6 hours and can be scheduled separately.

### Dependencies

```json
{
  "yjs": "^13.6.0",
  "@tiptap/extension-collaboration": "^3.0.0",
  "@tiptap/extension-collaboration-cursor": "^3.0.0"
}
```

Supabase Realtime is already available via `@supabase/supabase-js` in the project.
