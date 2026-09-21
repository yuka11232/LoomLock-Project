# LoomLock architecture

How the product is put together, and what has to change to put it on a server.

Contents:

1. [Shape of the app](#1-shape-of-the-app)
2. [The permission model](#2-the-permission-model)
3. [The approval workflow](#3-the-approval-workflow)
4. [Data model](#4-data-model)
5. [Localisation](#5-localisation)
6. [Storage, and replacing it with a backend](#6-storage-and-replacing-it-with-a-backend)
7. [Accessibility decisions worth keeping](#7-accessibility-decisions-worth-keeping)

---

## 1. Shape of the app

There is one client-side store. `StoreProvider` holds an `AppState`, every
change goes through one reducer, and the result is written to `localStorage`.

```
StoreProvider  (lib/data/store.tsx)
  |- useReducer(reducer, freshState())      lib/data/reducer.ts
  |- repository.load()  on mount            lib/data/storage.ts
  |- repository.save(state)  on change
  |
  +- LocaleBridge -> I18nProvider           lib/i18n/index.tsx
       +- ToastProvider                     components/ui/toast.tsx
            +- pages
```

Three rules hold this together:

- **Components never compute derived data.** Anything derived lives in
  `lib/data/selectors.ts`, so the dashboard, the order board, and the storefront
  cannot disagree about what "active" or "complete" means.
- **Components never touch storage.** They dispatch. Only `storage.ts` knows
  where state lives.
- **Every business change records an activity event.** That is what makes the
  workspace feel shared rather than like two people using one account.

Hydration is deliberate: the server renders the seed, and saved state is swapped
in inside an effect. Workspace screens sit behind `HydrationGate` so a visitor
never sees seed data flash over their own work.

---

## 2. The permission model

`lib/permissions.ts` is the only place roles are interpreted. It exports a
matrix of action against role, resolving to one of four levels:

| Level | Meaning |
| --- | --- |
| `allowed` | Happens immediately |
| `needs_approval` | Happens, but queues for the owner before it takes effect |
| `suggest_only` | The person proposes a value; the owner sets the real one |
| `unavailable` | The owner handles this |

Two things matter about this file:

1. **It is rendered to users.** The Family page builds its permission table from
   `PERMISSION_TABLE` and `permission()`. The table people read is generated from
   the rules the app enforces, so they cannot drift apart.
2. **It is about coordination, not security.** Nothing here is a trust boundary.
   In the demo all state is in the visitor's own browser and the role switcher
   changes roles freely. When this moves to a server, these same rules must be
   re-expressed as row level security policies (section 6). The client copy stays
   useful for showing and hiding the right controls.

The wording follows from that. The interface says "This change needs the business
owner's confirmation before it becomes public", never a security warning.

---

## 3. The approval workflow

The approval queue is the hinge of the product, so it is worth being precise.

**A submission does not change the business.** Submitting sets the record to a
waiting state and opens an `Approval`. The change is applied at the moment the
owner approves, by `applyApproval()` in `lib/data/reducer.ts`. Nothing else in
the codebase applies a collaborator's public or financial change.

```
collaborator                        owner
     |                                |
     |  productSubmit                 |
     |  status -> in_review           |
     |  Approval{ pending } ----------> /approvals
     |                                |
     |                        approvalDecide "approve"
     |                                |  applyApproval()
     |                                |    status -> public
     |                                |    history += approved
     |                                |    activity += approved
     |                                |
     |                        approvalDecide "return"
     |                                |  applyReturn()
     |  <---------------------------- |    status -> draft
     |    reviewNote on the approval  |    note shown on the card
```

Four approval types, each with its own effect on approval:

| Type | Applying it does |
| --- | --- |
| `product_publish` | Product status becomes `public` |
| `content_publish` | Draft status becomes `approved` |
| `price_change` | `payload.toPrice` is written onto the product |
| `customer_reply` | The drafted message is recorded as sent on the order |

Returning is only meaningful for the first two; for a price or a reply, the note
on the card is the whole outcome.

Two smaller rules that avoid stale state:

- Deleting a product or a draft drops any still-pending approval pointing at it
  (`dropPendingApprovalsFor`).
- An owner acting directly (publishing a product themselves) also drops the
  pending approval, so the queue cannot hold a request that is already satisfied.

Which replies need approval is a product decision, not a technical one:
`TEMPLATE_COMMITS` in `lib/message-templates.ts` marks the templates that promise
a price or a date. Telling a customer their order is ready promises nothing and
goes straight out.

---

## 4. Data model

All types are in `lib/types.ts`. `AppState` is the whole workspace:

```
AppState
  business        Business            one per workspace
  members         Member[]            owner + collaborators
  products        Product[]           -> ProductImage[], ProductHistoryEntry[]
  contentDrafts   ContentDraft[]      -> productId
  approvals       Approval[]          -> targetId (product | draft | order)
  orders          Order[]             -> OrderNote[], productId?, assigneeId?
  lessonProgress  LessonProgress[]    (lessonSlug, memberId) pair
  activity        ActivityEvent[]     capped at 60, newest first
  invitations     Invitation[]
  settings        AppSettings         locale, active role, notifications
```

Notes on a few choices:

- **`Localized` pairs.** Any string belonging to *business content* is stored as
  `{ en, az }`, so switching language changes the products and the notes, not
  only the chrome. Interface strings are not here; they live in the dictionary.
- **`Approval.targetId` is loosely typed on purpose.** It points at whichever
  record the type implies. A stricter tagged union would be better with a real
  database and foreign keys.
- **Product completeness is derived, not stored.** `completeness()` decides what
  is missing, so the progress bar, the "Still missing" list, and the dashboard
  task all come from one definition. "Price on request" counts as a decision, not
  a gap.
- **`ProductImage` has two kinds.** `motif` images are drawn SVG swatches used by
  the demo and labelled as placeholders. `upload` images are real files
  downscaled in the browser to a roughly 900px JPEG data URL, which keeps a
  photograph near 100 KB so several fit in the storage budget.
- **Lesson content is not in state.** `lib/data/lessons.ts` is static content;
  only progress is stored. Editing a lesson never invalidates a save.

`SEED_VERSION` guards the shape. A saved state whose version does not match is
discarded and reseeded rather than half-migrated, which is the right trade for a
prototype and the wrong one for a product with real customer data.

### Future database entities

The types map onto tables almost directly:

```
users, profiles, businesses, business_members,
products, product_images, content_drafts, approvals,
customer_enquiries, orders, order_notes,
learning_modules, learning_progress, invitations, activity_events
```

`business_members` carries the role and is the join every policy checks.
`customer_enquiries` splits from `orders` once enquiries can arrive from a real
public site, with an order created when the family accepts one.

---

## 5. Localisation

Two separate mechanisms, because they solve different problems.

**Interface strings** live in `lib/i18n/en.ts`. `az.ts` is typed as
`Dictionary = typeof en`, so a missing Azerbaijani string is a compile error
rather than a blank in the interface. Strings that interpolate are functions:

```ts
progress: (done: number, total: number) => `${done} of ${total} finished`
```

Components read the tree directly, which keeps type safety and autocompletion:

```tsx
const { d, t, locale } = useI18n();
d.products.title            // interface string
t(product.name)             // business content, in the active language
```

**Business content** is a `Localized` pair on the record. `t()` reads the active
language and falls back to English if the other side is empty.

When someone writes a product story, `applyDraft()` writes the language they are
using and mirrors it into the empty one, so the storefront is never blank in one
language. It does not translate: an artisan's own words are not machine
translated on their behalf.

The locale lives in `AppState.settings`, so changing language is a saved change
that survives a refresh, and `<html lang>` is kept in step for screen readers.

### Adding Russian

1. Create `lib/i18n/ru.ts` typed as `Dictionary`. The compiler lists what is
   missing.
2. Add `ru` to `Locale` in `lib/types.ts`, and to `DICTIONARIES`, `LOCALES`,
   `LOCALE_NAMES`, `LOCALE_CODES` in `lib/i18n/index.tsx`.
3. Add a `ru` key to every `Localized` pair in `lib/data/seed.ts` and
   `lib/data/lessons.ts`.
4. Add a locale tag to `LOCALE_TAG` in `lib/utils.ts` for dates and numbers.

Nothing else reads a locale string directly.

---

## 6. Storage, and replacing it with a backend

`lib/data/storage.ts` is the only file that knows where state lives:

```ts
export interface StateRepository {
  load(): Promise<AppState | null>;
  save(state: AppState): Promise<void>;
  clear(): Promise<void>;
}
```

The interface is async even though `localStorage` is not, so swapping in a
network implementation does not change a single call site.

Reads are defensive: a saved state can be from an older seed, hand edited, or
truncated, and anything unreadable falls back to a fresh seed rather than
leaving the app broken. Writes catch quota errors and surface them as a visible
notice instead of failing silently.

### Adding Supabase

Keep it optional. A missing key must never break the demo:

```ts
const source = process.env.NEXT_PUBLIC_LOOMLOCK_DATA_SOURCE ?? "demo";
export const repository: StateRepository =
  source === "supabase" && hasSupabaseKeys()
    ? supabaseRepository
    : localStorageRepository;
```

Environment variables are documented in `.env.example`. The service role key is
server-only and must never reach the browser.

**Migration in three steps, in this order:**

1. **Keep the whole-state shape.** The first Supabase repository can store one
   JSON document per business. Nothing above `storage.ts` changes, and the app
   is immediately multi-device.
2. **Split into tables.** Replace the reducer's whole-state writes with per-entity
   mutations. The reducer's action list is already a list of the mutations the
   API needs: `productSubmit`, `approvalDecide`, `orderStage`, and so on map
   one-to-one onto endpoints or RPCs.
3. **Move the rules to the server.** Until this step, permissions are a client
   convenience. After it, they are enforced.

**Row level security plan.** Every table is scoped to a business, and membership
is the check:

```sql
-- read: you can see a business you belong to
create policy "members read" on products for select
using (exists (
  select 1 from business_members m
  where m.business_id = products.business_id
    and m.user_id = auth.uid()
));

-- write: any member may create and edit a draft
create policy "members write drafts" on products for update
using (exists (
  select 1 from business_members m
  where m.business_id = products.business_id
    and m.user_id = auth.uid()
))
with check (status <> 'public');   -- publishing is not an ordinary edit

-- publish: owners only, which is the approval step made real
create policy "owners publish" on products for update
using (exists (
  select 1 from business_members m
  where m.business_id = products.business_id
    and m.user_id = auth.uid()
    and m.role = 'owner'
));
```

The same shape applies to `approvals` (only an owner may move one out of
`pending`), to price columns, and to `business_members` itself. Public storefront
reads are the exception: a separate policy exposes only products with
`status = 'public'`, and only the columns a customer should see.

Anything that must stay private to the owner (cost records, payout details) is a
separate table with an owner-only policy, not a column on `businesses`.

---

## 7. Accessibility decisions worth keeping

These were deliberate and are easy to undo by accident:

- **Status is never colour alone.** Every badge carries an icon and a word, so
  meaning survives greyscale and colour blindness.
- **`Field` owns the wiring.** Label, help text, and error are connected by
  `aria-describedby` and `aria-invalid` in one place. A control without a visible
  label is a bug, not a style choice.
- **The order board moves with buttons, not drag and drop.** A drag target is
  hard to hit on a phone and impossible on a keyboard.
- **Filter rows are a real tablist.** One tab stop, arrow keys move between
  filters.
- **Dialogs trap focus, restore it on close, and close on Escape.**
- **Motion is opt-out.** Every animation is disabled under
  `prefers-reduced-motion`.
- **`.grid > * { min-width: 0 }`** in the base layer. Grid items default to
  `min-width: auto`, which pushed a dashboard card past the edge of a phone
  screen and scrolled the whole page sideways.
- **`scroll-strip-x` uses `contain: paint`.** Without it Chrome counts a
  horizontally scrolling strip's full content width toward the document's
  scrollable area, so a stray swipe on the order board dragged the entire
  interface off screen. Root level `overflow-x: clip` does not fix it; paint
  containment on the strip does.
