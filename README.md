# LoomLock

**[Open the live demo →](https://yuka11232.github.io/LoomLock-Project/)**

A shared digital workspace for artisan families: one place where a craftsperson
and a younger relative run the business side of handmade work together.

The artisan brings the craft, the story, and the final say on anything public.
The younger family member brings photographs, captions, customer replies, and an
organised order board. LoomLock gives both of them the same workspace, a clear
approval step between them, and short lessons that teach each of them the part
they have not learned yet.

Traditional knowledge and digital knowledge should work together, not compete.

---

## What LoomLock is not

Worth stating plainly, because these are easy assumptions to make:

- **Not a social media publisher.** It prepares a caption and a photograph for
  you to copy across by hand. It does not post to Instagram, Facebook, or TikTok,
  and it does not hold your account credentials.
- **Not a shop.** No payments, no checkout, no bank connection. A price is agreed
  by message between a customer and the family.
- **Not a monitoring tool.** Nothing tracks a younger family member for a parent
  to review. The activity feed shows what happened to the business, and both
  people see exactly the same feed.
- **Not a research project or a security product.** Permissions exist so a family
  can divide work sensibly, not to police anybody.
- **Not an AI writer.** The caption builder assembles sentences from what the
  family already wrote about a product. It never invents a cultural claim.

---

## The two roles

| | Artisan Owner | Young Family Collaborator |
|---|---|---|
| Who | The craftsperson who runs the business | A child, grandchild, or younger relative helping out |
| Brings | The craft, the story, what the work is worth | Photographs, captions, replies, organisation |
| Decides | Prices, what goes public, who joins | Proposes; the owner confirms |

The full permission table lives in [`lib/permissions.ts`](lib/permissions.ts) and
is rendered to users on the Family page, so the table people read and the rules
the app enforces cannot drift apart.

| Action | Artisan Owner | Young Collaborator |
| --- | ---: | ---: |
| View the dashboard | Yes | Yes |
| Add / edit a product draft | Yes | Yes |
| Put a product on the public page | Yes | Needs approval |
| Draft social content | Yes | Yes |
| Approve public content | Yes | No |
| Move an order forward | Yes | Yes |
| Set the final price | Yes | Suggest only |
| Invite or remove members | Yes | No |
| Private business settings | Yes | No |

---

## Core user flows

1. **Add a product.** Six guided questions instead of a form: what is it, its
   story, how it is made, price and availability, photographs, then review. Any
   step can be skipped and finished later.
2. **Prepare a post.** Pick a product, a goal, and a tone. LoomLock builds a
   caption starter out of that product's own fields and leaves a marked
   `[square bracket]` wherever it has nothing honest to say. The family edits it,
   previews it, and copies or exports it.
3. **Send it for approval.** A collaborator's public or financial change opens an
   approval. The owner approves it (which is what actually applies the change) or
   sends it back with a note.
4. **Keep orders moving.** Enquiries arrive on a six stage board. Cards carry a
   name and a next action. Prepared messages cover the five common situations and
   are always editable before they are copied.
5. **Learn a little.** Ten short lessons. A lesson counts as finished when the
   learner writes down how it applies to their own business.
6. **Be findable.** A public storefront shows the artisan's story and the
   products the family chose to publish, with an enquiry form that drops a new
   order onto the board.

---

## Technical stack

- **Next.js 16** (App Router) and **React 19**
- **TypeScript**, strict
- **Tailwind CSS v4** (CSS-first config in `app/globals.css`)
- **Lucide** icons
- **React Hook Form** and **Zod** are installed for the forms that will need
  schema validation once there is a backend to reject bad input
- No database, no API keys, no environment variables required

State lives in one reducer and persists to `localStorage`. There is no server
component doing data work, because there is no server data yet.

---

## Running it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build
npm run start        # serve the production build
npm run typecheck    # tsc --noEmit
```

No `.env` file is needed. `.env.example` documents the optional Supabase
variables for later; their absence must never break the demo.

---

## Trying the demo

1. Open `/` and choose **Open the demo workspace**.
2. Pick a role. **Nərgiz** is the artisan owner, **Leyla** is the young
   collaborator. Both land in the same seeded business.
3. Things worth doing, in this order:
   - As **Nərgiz**, open **Approvals**. Three things are waiting: a product Leyla
     finished, a caption she wrote, and a price she suggested. Approve one and
     watch it take effect in Products.
   - Switch to **Leyla** with the role switcher in the header. The approve
     buttons are gone; the price field becomes "Suggest a price".
   - Open **Social posts**. One draft came back with a note from Nərgiz asking
     for the marketing language to come out. Fix it and send it back.
   - Move a card on the **Orders** board and add a note.
   - Open the **public page** from the sidebar and send yourself an enquiry. It
     appears on the order board as a new enquiry.
   - Switch the language to **AZ** in the header. The interface and the demo
     content both change, and the choice survives a refresh.
4. **Settings → Reset the demo** puts everything back.

Everything you change is saved in that browser only. Refreshing keeps it;
clearing site data or resetting removes it.

The business, the people, the products, and the customers are fictional.

---

## Folder structure

```
app/
  page.tsx                 landing page
  demo/                    role picker, entry into the workspace
  onboarding/              six step business setup
  privacy/  terms/         legal pages
  store/[slug]/            public storefront and enquiry form
  (app)/                   the workspace, all behind the shared shell
    dashboard/  products/  content/  orders/
    approvals/  learn/  team/  settings/
  icon.svg                 favicon
  globals.css              design tokens, base rules, utilities

components/
  ui/                      button, card, badge, field, dialog, toast, ...
  app/                     shell, nav, role switcher, language switcher, chrome
  domain/                  product card, order card, caption editor, motifs

lib/
  types.ts                 the domain model
  permissions.ts           the permission matrix, enforced and displayed
  content-starters.ts      caption scaffolding rules
  message-templates.ts     prepared customer messages
  i18n/                    en.ts, az.ts, provider
  data/
    seed.ts                the demo business
    lessons.ts             the ten lessons
    reducer.ts             every state transition
    selectors.ts           derived views (tasks, completeness, counts)
    storage.ts             the storage boundary
    store.tsx              provider and hooks

docs/ARCHITECTURE.md       permissions, approvals, data model, backend plan
```

---

## Current limitations

- **One device.** State is in `localStorage`. Two people cannot actually share a
  workspace yet; the role switcher simulates it.
- **No real invitations.** Inviting a family member records the invitation. No
  message is sent.
- **No publishing, payments, or messaging.** By design for the MVP. Every place
  a user might expect one says so.
- **Bilingual content is not translated for you.** Writing a product story in
  English fills the English field and mirrors it into Azerbaijani until someone
  edits it. LoomLock will not machine-translate an artisan's own words.
- **Photographs are per-device.** They are downscaled and stored locally, so they
  do not follow you to another browser. Browser storage is roughly 5 MB.
- **Demo photography is illustrative.** Products ship with drawn woven swatches,
  labelled as placeholders. There are no stock photos of handmade work.
- **Legal pages need two details.** `/privacy` and `/terms` are written for this
  build but carry marked placeholders for the operator's contact address and
  governing law.

---

## Before this goes live

- [ ] Connect a custom domain
- [ ] Fill in the contact address and governing law on `/privacy` and `/terms`
- [x] Favicon
- [x] Privacy policy page
- [x] Terms and conditions page
- [x] No third-party analytics, trackers, or "made with" badges

---

## Roadmap

**Next**

- Supabase behind the existing storage boundary, so two people share one
  workspace on two devices (schema and row level security plan are in
  `docs/ARCHITECTURE.md`)
- Real invitations by email or SMS
- Russian as a third language (the dictionary and content model already hold it)

**Later**

- Export a post package straight to a phone
- Cost and profit records for the owner, kept private to them
- Direct publishing to Instagram and Facebook, if it can be done without holding
  a family's credentials
- Optional AI assistance for drafting, only ever suggesting from what the family
  has already written
