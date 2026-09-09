import type {
  ActivityEvent,
  ActivityKind,
  AppState,
  Approval,
  ContentDraft,
  Locale,
  Localized,
  Member,
  Order,
  OrderStage,
  Product,
  Role,
} from "../types";
import { newId, nowIso } from "../utils";
import { freshState } from "./storage";

/**
 * The single reducer behind the whole workspace.
 *
 * Two rules hold everywhere:
 *   1. Every action that changes business data also records an ActivityEvent,
 *      so the family can always see what happened and who did it.
 *   2. Approvals are the only path by which a collaborator's public, financial,
 *      or hard-to-undo change takes effect. Approving an approval is what
 *      applies the underlying change — see `applyApproval`.
 */

export type Action =
  /* session */
  | { type: "hydrate"; state: AppState }
  | { type: "reset" }
  | { type: "setLocale"; locale: Locale }
  | { type: "setActiveMember"; memberId: string }
  | { type: "setNotify"; key: keyof AppState["settings"]["notify"]; value: boolean }
  | { type: "completeOnboarding" }
  | { type: "updateBusiness"; patch: Partial<AppState["business"]> }
  /* products */
  | { type: "productSave"; product: Product; actorId: string; isNew: boolean }
  | { type: "productDelete"; productId: string; actorId: string }
  | { type: "productSubmit"; productId: string; actorId: string }
  | { type: "productPublish"; productId: string; actorId: string }
  | { type: "productUnpublish"; productId: string; actorId: string }
  | {
      type: "priceSuggest";
      productId: string;
      price: number | null;
      reason: string;
      actorId: string;
    }
  | { type: "priceSet"; productId: string; price: number | null; actorId: string }
  /* content */
  | { type: "contentSave"; draft: ContentDraft; actorId: string; isNew: boolean }
  | { type: "contentDelete"; draftId: string; actorId: string }
  | { type: "contentSubmit"; draftId: string; actorId: string }
  /* approvals */
  | { type: "approvalDecide"; approvalId: string; decision: "approve" | "return"; note: string; actorId: string }
  /* orders */
  | { type: "orderCreate"; order: Order; actorId: string }
  | { type: "orderStage"; orderId: string; stage: OrderStage; actorId: string }
  | { type: "orderAssign"; orderId: string; memberId: string | null; actorId: string }
  | { type: "orderPatch"; orderId: string; patch: Partial<Order>; actorId: string }
  | { type: "orderNote"; orderId: string; body: string; kind: "note" | "message_sent"; actorId: string }
  | { type: "orderDelete"; orderId: string; actorId: string }
  | { type: "customerReplySubmit"; orderId: string; message: string; actorId: string }
  /* learning */
  | { type: "lessonComplete"; slug: string; title: Localized; memberId: string; note: string }
  /* team */
  | { type: "inviteCreate"; name: string; contact: string; role: Role; actorId: string }
  | { type: "inviteRemove"; invitationId: string }
  | { type: "memberRemove"; memberId: string; actorId: string };

/* ------------------------------------------------------------------ helpers */

const MAX_ACTIVITY = 60;

function memberName(state: AppState, id: string): string {
  return state.members.find((m) => m.id === id)?.name ?? "Someone";
}

function record(
  state: AppState,
  actorId: string,
  kind: ActivityKind,
  summary: Localized,
  entity?: ActivityEvent["entity"],
): AppState {
  const event: ActivityEvent = {
    id: newId("act"),
    at: nowIso(),
    actorId,
    kind,
    summary,
    entity,
  };
  return { ...state, activity: [event, ...state.activity].slice(0, MAX_ACTIVITY) };
}

function patchProduct(
  state: AppState,
  productId: string,
  patch: (product: Product) => Product,
): AppState {
  return {
    ...state,
    products: state.products.map((p) => (p.id === productId ? patch(p) : p)),
  };
}

function patchDraft(
  state: AppState,
  draftId: string,
  patch: (draft: ContentDraft) => ContentDraft,
): AppState {
  return {
    ...state,
    contentDrafts: state.contentDrafts.map((c) => (c.id === draftId ? patch(c) : c)),
  };
}

function patchOrder(
  state: AppState,
  orderId: string,
  patch: (order: Order) => Order,
): AppState {
  return { ...state, orders: state.orders.map((o) => (o.id === orderId ? patch(o) : o)) };
}

function addHistory(
  product: Product,
  actorId: string,
  kind: Product["history"][number]["kind"],
  note?: string,
): Product {
  return {
    ...product,
    updatedAt: nowIso(),
    history: [
      ...product.history,
      { id: newId("hist"), at: nowIso(), actorId, kind, ...(note ? { note } : {}) },
    ],
  };
}

/** Remove any still-pending approval pointing at a record that is going away. */
function dropPendingApprovalsFor(state: AppState, targetId: string): AppState {
  return {
    ...state,
    approvals: state.approvals.filter(
      (a) => !(a.targetId === targetId && a.status === "pending"),
    ),
  };
}

function openApproval(state: AppState, approval: Approval): AppState {
  return { ...state, approvals: [approval, ...state.approvals] };
}

/* -------------------------------------------------------- approval outcomes */

/**
 * Applying an approved request. This is where a collaborator's proposal
 * actually changes the business — never at the moment they submitted it.
 */
function applyApproval(state: AppState, approval: Approval, actorId: string): AppState {
  switch (approval.type) {
    case "product_publish": {
      const product = state.products.find((p) => p.id === approval.targetId);
      if (!product) return state;
      const next = patchProduct(state, approval.targetId, (p) =>
        addHistory({ ...p, status: "public" }, actorId, "approved"),
      );
      return record(
        next,
        actorId,
        "product_approved",
        {
          en: `${memberName(state, actorId)} approved ${product.name.en} for the public page`,
          az: `${memberName(state, actorId)} ${product.name.az} məhsulunu ictimai səhifə üçün təsdiqlədi`,
        },
        { type: "product", id: product.id },
      );
    }

    case "content_publish": {
      const draft = state.contentDrafts.find((c) => c.id === approval.targetId);
      if (!draft) return state;
      const product = state.products.find((p) => p.id === draft.productId);
      const next = patchDraft(state, approval.targetId, (c) => ({
        ...c,
        status: "approved",
        reviewNote: undefined,
        updatedAt: nowIso(),
      }));
      return record(
        next,
        actorId,
        "content_approved",
        {
          en: `${memberName(state, actorId)} approved the post about ${product?.name.en ?? "a product"}`,
          az: `${memberName(state, actorId)} ${product?.name.az ?? "bir məhsul"} haqqında paylaşımı təsdiqlədi`,
        },
        { type: "content", id: draft.id },
      );
    }

    case "price_change": {
      const product = state.products.find((p) => p.id === approval.targetId);
      if (!product) return state;
      const price = approval.payload?.toPrice ?? null;
      const next = patchProduct(state, approval.targetId, (p) =>
        addHistory(
          { ...p, price, priceOnRequest: price === null },
          actorId,
          "updated",
          `Price set to ${price === null ? "price on request" : `${price} AZN`}`,
        ),
      );
      return record(
        next,
        actorId,
        "price_changed",
        {
          en: `${memberName(state, actorId)} set the price of ${product.name.en}`,
          az: `${memberName(state, actorId)} ${product.name.az} məhsulunun qiymətini təyin etdi`,
        },
        { type: "product", id: product.id },
      );
    }

    case "customer_reply": {
      const orderId = approval.payload?.orderId;
      const message = approval.payload?.message ?? "";
      if (!orderId) return state;
      const order = state.orders.find((o) => o.id === orderId);
      const next = patchOrder(state, orderId, (o) => ({
        ...o,
        notes: [
          ...o.notes,
          {
            id: newId("note"),
            authorId: actorId,
            body: message,
            createdAt: nowIso(),
            kind: "message_sent",
          },
        ],
      }));
      return record(
        next,
        actorId,
        "order_note",
        {
          en: `${memberName(state, actorId)} approved and sent the reply for order ${order?.ref ?? ""}`.trim(),
          az: `${memberName(state, actorId)} ${order?.ref ?? ""} sifarişi üçün cavabı təsdiqləyib göndərdi`.trim(),
        },
        { type: "order", id: orderId },
      );
    }

    default:
      return state;
  }
}

/** Applying a returned request: put the record back where the family can edit it. */
function applyReturn(state: AppState, approval: Approval, actorId: string, note: string): AppState {
  switch (approval.type) {
    case "product_publish": {
      const product = state.products.find((p) => p.id === approval.targetId);
      if (!product) return state;
      const next = patchProduct(state, approval.targetId, (p) =>
        addHistory({ ...p, status: "draft" }, actorId, "returned", note),
      );
      return record(
        next,
        actorId,
        "product_returned",
        {
          en: `${memberName(state, actorId)} sent ${product.name.en} back with a note`,
          az: `${memberName(state, actorId)} ${product.name.az} məhsulunu qeydlə geri göndərdi`,
        },
        { type: "product", id: product.id },
      );
    }

    case "content_publish": {
      const draft = state.contentDrafts.find((c) => c.id === approval.targetId);
      if (!draft) return state;
      const product = state.products.find((p) => p.id === draft.productId);
      const next = patchDraft(state, approval.targetId, (c) => ({
        ...c,
        status: "changes_requested",
        reviewNote: note,
        updatedAt: nowIso(),
      }));
      return record(
        next,
        actorId,
        "content_returned",
        {
          en: `${memberName(state, actorId)} sent the post about ${product?.name.en ?? "a product"} back with a note`,
          az: `${memberName(state, actorId)} ${product?.name.az ?? "bir məhsul"} haqqında paylaşımı qeydlə geri göndərdi`,
        },
        { type: "content", id: draft.id },
      );
    }

    // A returned price suggestion or customer reply changes nothing; the note on
    // the approval card is the whole outcome.
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ reducer */

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    /* ---------------------------------------------------------- session */
    case "hydrate":
      return action.state;

    case "reset":
      return freshState();

    case "setLocale":
      return { ...state, settings: { ...state.settings, locale: action.locale } };

    case "setActiveMember":
      return { ...state, settings: { ...state.settings, activeMemberId: action.memberId } };

    case "setNotify":
      return {
        ...state,
        settings: {
          ...state.settings,
          notify: { ...state.settings.notify, [action.key]: action.value },
        },
      };

    case "completeOnboarding":
      return { ...state, settings: { ...state.settings, onboardingComplete: true } };

    case "updateBusiness":
      return { ...state, business: { ...state.business, ...action.patch } };

    /* --------------------------------------------------------- products */
    case "productSave": {
      const exists = state.products.some((p) => p.id === action.product.id);
      const saved: Product = { ...action.product, updatedAt: nowIso() };
      const withHistory = action.isNew
        ? { ...saved, history: [{ id: newId("hist"), at: nowIso(), actorId: action.actorId, kind: "created" as const }] }
        : addHistory(saved, action.actorId, "updated");

      const next: AppState = {
        ...state,
        products: exists
          ? state.products.map((p) => (p.id === saved.id ? withHistory : p))
          : [withHistory, ...state.products],
      };

      return record(
        next,
        action.actorId,
        action.isNew ? "product_created" : "product_updated",
        action.isNew
          ? {
              en: `${memberName(state, action.actorId)} added ${saved.name.en}`,
              az: `${memberName(state, action.actorId)} ${saved.name.az} əlavə etdi`,
            }
          : {
              en: `${memberName(state, action.actorId)} updated ${saved.name.en}`,
              az: `${memberName(state, action.actorId)} ${saved.name.az} məhsulunu yenilədi`,
            },
        { type: "product", id: saved.id },
      );
    }

    case "productDelete": {
      const product = state.products.find((p) => p.id === action.productId);
      if (!product) return state;
      const cleaned = dropPendingApprovalsFor(state, action.productId);
      return {
        ...cleaned,
        products: cleaned.products.filter((p) => p.id !== action.productId),
        // Drafts about a deleted product have nothing left to describe.
        contentDrafts: cleaned.contentDrafts.filter((c) => c.productId !== action.productId),
      };
    }

    case "productSubmit": {
      const product = state.products.find((p) => p.id === action.productId);
      if (!product) return state;

      let next = patchProduct(state, action.productId, (p) =>
        addHistory({ ...p, status: "in_review" }, action.actorId, "submitted"),
      );
      next = openApproval(next, {
        id: newId("approval"),
        type: "product_publish",
        targetId: product.id,
        title: {
          en: `Put ${product.name.en} on the public page`,
          az: `${product.name.az} məhsulunu ictimai səhifəyə qoy`,
        },
        summary: {
          en: `${memberName(state, action.actorId)} finished the listing and would like it published.`,
          az: `${memberName(state, action.actorId)} siyahını tamamladı və dərc olunmasını istəyir.`,
        },
        requestedBy: action.actorId,
        requestedAt: nowIso(),
        status: "pending",
      });

      return record(
        next,
        action.actorId,
        "product_submitted",
        {
          en: `${memberName(state, action.actorId)} sent ${product.name.en} for approval`,
          az: `${memberName(state, action.actorId)} ${product.name.az} məhsulunu təsdiqə göndərdi`,
        },
        { type: "product", id: product.id },
      );
    }

    case "productPublish": {
      const product = state.products.find((p) => p.id === action.productId);
      if (!product) return state;
      let next = dropPendingApprovalsFor(state, action.productId);
      next = patchProduct(next, action.productId, (p) =>
        addHistory({ ...p, status: "public" }, action.actorId, "approved"),
      );
      return record(
        next,
        action.actorId,
        "product_approved",
        {
          en: `${memberName(state, action.actorId)} put ${product.name.en} on the public page`,
          az: `${memberName(state, action.actorId)} ${product.name.az} məhsulunu ictimai səhifəyə qoydu`,
        },
        { type: "product", id: product.id },
      );
    }

    case "productUnpublish": {
      const product = state.products.find((p) => p.id === action.productId);
      if (!product) return state;
      const next = patchProduct(state, action.productId, (p) =>
        addHistory({ ...p, status: "draft" }, action.actorId, "unpublished"),
      );
      return record(
        next,
        action.actorId,
        "product_updated",
        {
          en: `${memberName(state, action.actorId)} took ${product.name.en} off the public page`,
          az: `${memberName(state, action.actorId)} ${product.name.az} məhsulunu ictimai səhifədən götürdü`,
        },
        { type: "product", id: product.id },
      );
    }

    case "priceSuggest": {
      const product = state.products.find((p) => p.id === action.productId);
      if (!product) return state;
      const next = openApproval(state, {
        id: newId("approval"),
        type: "price_change",
        targetId: product.id,
        title: {
          en: `Set a price for ${product.name.en}`,
          az: `${product.name.az} üçün qiymət təyin et`,
        },
        summary: {
          en: `${memberName(state, action.actorId)} suggests ${action.price ?? "price on request"}${action.price === null ? "" : " AZN"}.`,
          az: `${memberName(state, action.actorId)} ${action.price === null ? "qiymətin sorğu ilə olmasını" : `${action.price} AZN`} təklif edir.`,
        },
        requestedBy: action.actorId,
        requestedAt: nowIso(),
        status: "pending",
        payload: { fromPrice: product.price, toPrice: action.price, reason: action.reason },
      });

      return record(
        next,
        action.actorId,
        "price_suggested",
        {
          en: `${memberName(state, action.actorId)} suggested a price for ${product.name.en}`,
          az: `${memberName(state, action.actorId)} ${product.name.az} üçün qiymət təklif etdi`,
        },
        { type: "product", id: product.id },
      );
    }

    case "priceSet": {
      const product = state.products.find((p) => p.id === action.productId);
      if (!product) return state;
      let next = dropPendingApprovalsFor(state, action.productId);
      next = patchProduct(next, action.productId, (p) =>
        addHistory(
          { ...p, price: action.price, priceOnRequest: action.price === null },
          action.actorId,
          "updated",
        ),
      );
      return record(
        next,
        action.actorId,
        "price_changed",
        {
          en: `${memberName(state, action.actorId)} set the price of ${product.name.en}`,
          az: `${memberName(state, action.actorId)} ${product.name.az} məhsulunun qiymətini təyin etdi`,
        },
        { type: "product", id: product.id },
      );
    }

    /* ---------------------------------------------------------- content */
    case "contentSave": {
      const exists = state.contentDrafts.some((c) => c.id === action.draft.id);
      const saved: ContentDraft = { ...action.draft, updatedAt: nowIso() };
      const product = state.products.find((p) => p.id === saved.productId);
      const next: AppState = {
        ...state,
        contentDrafts: exists
          ? state.contentDrafts.map((c) => (c.id === saved.id ? saved : c))
          : [saved, ...state.contentDrafts],
      };
      if (!action.isNew) return next;
      return record(
        next,
        action.actorId,
        "content_created",
        {
          en: `${memberName(state, action.actorId)} started a post about ${product?.name.en ?? "a product"}`,
          az: `${memberName(state, action.actorId)} ${product?.name.az ?? "bir məhsul"} haqqında paylaşıma başladı`,
        },
        { type: "content", id: saved.id },
      );
    }

    case "contentDelete": {
      const cleaned = dropPendingApprovalsFor(state, action.draftId);
      return {
        ...cleaned,
        contentDrafts: cleaned.contentDrafts.filter((c) => c.id !== action.draftId),
      };
    }

    case "contentSubmit": {
      const draft = state.contentDrafts.find((c) => c.id === action.draftId);
      if (!draft) return state;
      const product = state.products.find((p) => p.id === draft.productId);

      let next = patchDraft(state, action.draftId, (c) => ({
        ...c,
        status: "in_review",
        reviewNote: undefined,
        updatedAt: nowIso(),
      }));
      next = openApproval(next, {
        id: newId("approval"),
        type: "content_publish",
        targetId: draft.id,
        title: {
          en: `Approve the post about ${product?.name.en ?? "a product"}`,
          az: `${product?.name.az ?? "bir məhsul"} haqqında paylaşımı təsdiqlə`,
        },
        summary: {
          en: `${memberName(state, action.actorId)} prepared a caption and would like your confirmation before it goes out.`,
          az: `${memberName(state, action.actorId)} mətn hazırladı və paylaşmazdan əvvəl təsdiqinizi istəyir.`,
        },
        requestedBy: action.actorId,
        requestedAt: nowIso(),
        status: "pending",
      });

      return record(
        next,
        action.actorId,
        "content_submitted",
        {
          en: `${memberName(state, action.actorId)} sent the post about ${product?.name.en ?? "a product"} for approval`,
          az: `${memberName(state, action.actorId)} ${product?.name.az ?? "bir məhsul"} haqqında paylaşımı təsdiqə göndərdi`,
        },
        { type: "content", id: draft.id },
      );
    }

    /* -------------------------------------------------------- approvals */
    case "approvalDecide": {
      const approval = state.approvals.find((a) => a.id === action.approvalId);
      if (!approval || approval.status !== "pending") return state;

      const decided: Approval = {
        ...approval,
        status: action.decision === "approve" ? "approved" : "returned",
        decidedBy: action.actorId,
        decidedAt: nowIso(),
        reviewNote: action.note.trim() || undefined,
      };

      const withDecision: AppState = {
        ...state,
        approvals: state.approvals.map((a) => (a.id === approval.id ? decided : a)),
      };

      return action.decision === "approve"
        ? applyApproval(withDecision, approval, action.actorId)
        : applyReturn(withDecision, approval, action.actorId, action.note.trim());
    }

    /* ----------------------------------------------------------- orders */
    case "orderCreate": {
      const next: AppState = { ...state, orders: [action.order, ...state.orders] };
      return record(
        next,
        action.actorId,
        action.order.source === "storefront" ? "enquiry_received" : "order_created",
        {
          en: `New enquiry from ${action.order.customerName}`,
          az: `${action.order.customerName} adlı şəxsdən yeni sorğu`,
        },
        { type: "order", id: action.order.id },
      );
    }

    case "orderStage": {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order || order.stage === action.stage) return state;
      const next = patchOrder(state, action.orderId, (o) => ({ ...o, stage: action.stage }));
      return record(
        next,
        action.actorId,
        "order_stage_changed",
        {
          en: `${memberName(state, action.actorId)} moved order ${order.ref} forward`,
          az: `${memberName(state, action.actorId)} ${order.ref} sifarişini hərəkət etdirdi`,
        },
        { type: "order", id: order.id },
      );
    }

    case "orderAssign": {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order) return state;
      const next = patchOrder(state, action.orderId, (o) => ({ ...o, assigneeId: action.memberId }));
      const who = action.memberId ? memberName(state, action.memberId) : null;
      return record(
        next,
        action.actorId,
        "order_assigned",
        who
          ? {
              en: `Order ${order.ref} is now ${who}'s`,
              az: `${order.ref} sifarişi indi ${who} adlı şəxsindir`,
            }
          : {
              en: `Order ${order.ref} has nobody assigned`,
              az: `${order.ref} sifarişinə heç kim təyin olunmayıb`,
            },
        { type: "order", id: order.id },
      );
    }

    case "orderPatch":
      return patchOrder(state, action.orderId, (o) => ({ ...o, ...action.patch }));

    case "orderNote": {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order) return state;
      const next = patchOrder(state, action.orderId, (o) => ({
        ...o,
        notes: [
          ...o.notes,
          {
            id: newId("note"),
            authorId: action.actorId,
            body: action.body,
            createdAt: nowIso(),
            kind: action.kind,
          },
        ],
      }));
      return record(
        next,
        action.actorId,
        "order_note",
        {
          en: `${memberName(state, action.actorId)} added a note to order ${order.ref}`,
          az: `${memberName(state, action.actorId)} ${order.ref} sifarişinə qeyd əlavə etdi`,
        },
        { type: "order", id: order.id },
      );
    }

    case "orderDelete": {
      const cleaned = dropPendingApprovalsFor(state, action.orderId);
      return { ...cleaned, orders: cleaned.orders.filter((o) => o.id !== action.orderId) };
    }

    case "customerReplySubmit": {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order) return state;
      const next = openApproval(state, {
        id: newId("approval"),
        type: "customer_reply",
        targetId: order.id,
        title: {
          en: `Send a reply to ${order.customerName}`,
          az: `${order.customerName} adlı şəxsə cavab göndər`,
        },
        summary: {
          en: `${memberName(state, action.actorId)} drafted a reply for order ${order.ref}.`,
          az: `${memberName(state, action.actorId)} ${order.ref} sifarişi üçün cavab hazırladı.`,
        },
        requestedBy: action.actorId,
        requestedAt: nowIso(),
        status: "pending",
        payload: { orderId: order.id, message: action.message },
      });
      return record(
        next,
        action.actorId,
        "order_note",
        {
          en: `${memberName(state, action.actorId)} sent a reply for order ${order.ref} for approval`,
          az: `${memberName(state, action.actorId)} ${order.ref} sifarişi üçün cavabı təsdiqə göndərdi`,
        },
        { type: "order", id: order.id },
      );
    }

    /* --------------------------------------------------------- learning */
    case "lessonComplete": {
      const already = state.lessonProgress.some(
        (p) => p.lessonSlug === action.slug && p.memberId === action.memberId,
      );
      const entry = {
        lessonSlug: action.slug,
        memberId: action.memberId,
        completedAt: nowIso(),
        actionNote: action.note,
      };
      const next: AppState = {
        ...state,
        lessonProgress: already
          ? state.lessonProgress.map((p) =>
              p.lessonSlug === action.slug && p.memberId === action.memberId ? entry : p,
            )
          : [entry, ...state.lessonProgress],
      };
      // Re-editing an answer is not news; only the first completion is.
      if (already) return next;
      return record(
        next,
        action.memberId,
        "lesson_completed",
        {
          en: `${memberName(state, action.memberId)} finished the lesson: ${action.title.en}`,
          az: `${memberName(state, action.memberId)} dərsi bitirdi: ${action.title.az}`,
        },
        { type: "lesson", id: action.slug },
      );
    }

    /* ------------------------------------------------------------- team */
    case "inviteCreate": {
      const invitation = {
        id: newId("invitation"),
        name: action.name,
        contact: action.contact,
        role: action.role,
        invitedBy: action.actorId,
        invitedAt: nowIso(),
        status: "pending" as const,
      };
      const next: AppState = { ...state, invitations: [invitation, ...state.invitations] };
      return record(
        next,
        action.actorId,
        "member_invited",
        {
          en: `${memberName(state, action.actorId)} invited ${action.name} to help with the business`,
          az: `${memberName(state, action.actorId)} ${action.name} adlı şəxsi biznesə kömək üçün dəvət etdi`,
        },
        { type: "member", id: invitation.id },
      );
    }

    case "inviteRemove":
      return {
        ...state,
        invitations: state.invitations.filter((i) => i.id !== action.invitationId),
      };

    case "memberRemove": {
      const member = state.members.find((m) => m.id === action.memberId);
      // The workspace must always keep one owner.
      if (!member || member.role === "owner") return state;
      const remaining: Member[] = state.members.filter((m) => m.id !== action.memberId);
      return {
        ...state,
        members: remaining,
        // Their past work stays; only live assignments are released.
        orders: state.orders.map((o) =>
          o.assigneeId === action.memberId ? { ...o, assigneeId: null } : o,
        ),
        settings: {
          ...state.settings,
          activeMemberId:
            state.settings.activeMemberId === action.memberId
              ? (remaining.find((m) => m.role === "owner")?.id ?? remaining[0]?.id ?? "")
              : state.settings.activeMemberId,
        },
      };
    }

    default:
      return state;
  }
}
