import type {
  AppState,
  Approval,
  ContentDraft,
  Lesson,
  Locale,
  Localized,
  Member,
  Order,
  Product,
  Role,
} from "../types";
import { LESSONS } from "./lessons";

/**
 * Derived views over the state. Kept out of components so the dashboard, the
 * order board, and the storefront cannot disagree about what "active" means.
 */

/* --------------------------------------------------------------- products */

export interface Completeness {
  /** 0-100. */
  percent: number;
  /** Field keys still missing, for the "Still missing" list. */
  missing: ProductField[];
  isComplete: boolean;
}

export type ProductField =
  | "name"
  | "description"
  | "story"
  | "price"
  | "productionDays"
  | "materials"
  | "dimensions"
  | "photos";

const REQUIRED_FIELDS: ProductField[] = [
  "name",
  "description",
  "story",
  "price",
  "productionDays",
  "materials",
  "dimensions",
  "photos",
];

export function completeness(product: Product): Completeness {
  const missing: ProductField[] = [];

  if (!product.name.en.trim()) missing.push("name");
  if (!product.description.en.trim()) missing.push("description");
  if (!product.story.en.trim()) missing.push("story");
  // "Price on request" is a decision, not a gap.
  if (product.price === null && !product.priceOnRequest) missing.push("price");
  if (product.productionDays === null) missing.push("productionDays");
  if (product.materials.length === 0) missing.push("materials");
  if (!product.dimensions.trim()) missing.push("dimensions");
  if (product.images.length === 0) missing.push("photos");

  const done = REQUIRED_FIELDS.length - missing.length;
  return {
    percent: Math.round((done / REQUIRED_FIELDS.length) * 100),
    missing,
    isComplete: missing.length === 0,
  };
}

export function coverImage(product: Product) {
  return product.images.find((image) => image.isCover) ?? product.images[0];
}

export function publicProducts(state: AppState): Product[] {
  return state.products.filter((p) => p.status === "public");
}

export function productsNeedingPhotos(state: AppState): Product[] {
  return state.products.filter((p) => p.images.length === 0 && p.status !== "public");
}

export function unfinishedProducts(state: AppState): Product[] {
  return state.products.filter((p) => p.status !== "public" && !completeness(p).isComplete);
}

/* --------------------------------------------------------------- approvals */

export function pendingApprovals(state: AppState): Approval[] {
  return state.approvals
    .filter((a) => a.status === "pending")
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
}

export function decidedApprovals(state: AppState): Approval[] {
  return state.approvals
    .filter((a) => a.status !== "pending")
    .sort((a, b) => (b.decidedAt ?? "").localeCompare(a.decidedAt ?? ""));
}

/** What a given member has sent to the owner and is still waiting on. */
export function approvalsRequestedBy(state: AppState, memberId: string): Approval[] {
  return pendingApprovals(state).filter((a) => a.requestedBy === memberId);
}

/* ------------------------------------------------------------------ orders */

export const ACTIVE_STAGES = ["new_enquiry", "discussing", "confirmed", "in_production", "ready"] as const;

export function activeOrders(state: AppState): Order[] {
  return state.orders.filter((o) => o.stage !== "delivered");
}

export function newEnquiries(state: AppState): Order[] {
  return state.orders.filter((o) => o.stage === "new_enquiry");
}

export function ordersFor(state: AppState, memberId: string): Order[] {
  return activeOrders(state).filter((o) => o.assigneeId === memberId);
}

export function unassignedActiveOrders(state: AppState): Order[] {
  return activeOrders(state).filter((o) => !o.assigneeId);
}

/** Days until the due date; negative when it has passed. Null when no date. */
export function daysUntilDue(order: Order): number | null {
  if (!order.dueDate) return null;
  const due = new Date(order.dueDate).getTime();
  if (Number.isNaN(due)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today.getTime()) / 86_400_000);
}

/* ----------------------------------------------------------------- content */

export function draftsAwaitingOwner(state: AppState): ContentDraft[] {
  return state.contentDrafts.filter((c) => c.status === "in_review");
}

export function draftsNeedingChanges(state: AppState): ContentDraft[] {
  return state.contentDrafts.filter((c) => c.status === "changes_requested");
}

/* ---------------------------------------------------------------- learning */

export function lessonsCompletedBy(state: AppState, memberId: string): string[] {
  return state.lessonProgress.filter((p) => p.memberId === memberId).map((p) => p.lessonSlug);
}

export function progressFor(state: AppState, memberId: string, slug: string) {
  return state.lessonProgress.find((p) => p.memberId === memberId && p.lessonSlug === slug);
}

export function suggestedLessons(role: Role): Lesson[] {
  return LESSONS.filter((lesson) => lesson.suggestedFor.includes(role));
}

/** The next lesson LoomLock suggests: first unfinished one aimed at this role. */
export function nextLesson(state: AppState, member: Member): Lesson | undefined {
  const done = new Set(lessonsCompletedBy(state, member.id));
  return (
    suggestedLessons(member.role).find((lesson) => !done.has(lesson.slug)) ??
    LESSONS.find((lesson) => !done.has(lesson.slug))
  );
}

/* ------------------------------------------------------------------ people */

export function memberById(state: AppState, id: string | null | undefined): Member | undefined {
  if (!id) return undefined;
  return state.members.find((m) => m.id === id);
}

export function activeMember(state: AppState): Member {
  return (
    state.members.find((m) => m.id === state.settings.activeMemberId) ??
    state.members.find((m) => m.role === "owner") ??
    state.members[0]
  );
}

export function owner(state: AppState): Member | undefined {
  return state.members.find((m) => m.role === "owner");
}

/* -------------------------------------------------------- dashboard tasks */

export interface SuggestedTask {
  id: string;
  label: Localized;
  href: string;
  /** Drives the icon and the accent on the task row. */
  kind: "photos" | "approval" | "enquiry" | "order" | "lesson" | "product" | "waiting";
  /** Higher sorts first. */
  weight: number;
}

/**
 * "What needs doing" — the dashboard's core list.
 *
 * Built from the same state everything else reads, so completing an action
 * genuinely removes its row. Ordered by urgency to the business: an unanswered
 * customer outranks an unfinished draft.
 */
export function suggestedTasks(state: AppState, member: Member, lessonTitle: (slug: string) => Localized): SuggestedTask[] {
  const tasks: SuggestedTask[] = [];
  const isOwner = member.role === "owner";

  const enquiries = newEnquiries(state);
  if (enquiries.length > 0) {
    tasks.push({
      id: "task_enquiries",
      kind: "enquiry",
      weight: 100,
      href: "/orders",
      label: {
        en:
          enquiries.length === 1
            ? "Respond to a customer enquiry"
            : `Respond to ${enquiries.length} customer enquiries`,
        az:
          enquiries.length === 1
            ? "Bir müştəri sorğusuna cavab verin"
            : `${enquiries.length} müştəri sorğusuna cavab verin`,
      },
    });
  }

  const pending = pendingApprovals(state);
  if (isOwner && pending.length > 0) {
    // Name the single case so the row reads like a sentence, not a counter.
    const first = pending[0];
    tasks.push({
      id: "task_approvals",
      kind: "approval",
      weight: 95,
      href: "/approvals",
      label:
        pending.length === 1
          ? { en: `Review: ${first.title.en}`, az: `Nəzərdən keçir: ${first.title.az}` }
          : {
              en: `Review ${pending.length} requests from your family`,
              az: `Ailənizdən gələn ${pending.length} sorğunu nəzərdən keçirin`,
            },
    });
  }

  if (!isOwner) {
    const mine = approvalsRequestedBy(state, member.id);
    if (mine.length > 0) {
      tasks.push({
        id: "task_waiting",
        kind: "waiting",
        weight: 40,
        href: "/approvals",
        label: {
          en:
            mine.length === 1
              ? "1 of your submissions is with the owner"
              : `${mine.length} of your submissions are with the owner`,
          az:
            mine.length === 1
              ? "Göndərdiyiniz 1 iş sahibkardadır"
              : `Göndərdiyiniz ${mine.length} iş sahibkardadır`,
        },
      });
    }

    const returned = draftsNeedingChanges(state);
    if (returned.length > 0) {
      tasks.push({
        id: "task_returned",
        kind: "product",
        weight: 90,
        href: "/content?filter=changes_requested",
        label: {
          en:
            returned.length === 1
              ? "A post came back with a note — make the change"
              : `${returned.length} posts came back with notes`,
          az:
            returned.length === 1
              ? "Bir paylaşım qeydlə qayıtdı — dəyişikliyi edin"
              : `${returned.length} paylaşım qeydlərlə qayıtdı`,
        },
      });
    }
  }

  const needPhotos = productsNeedingPhotos(state);
  if (needPhotos.length > 0) {
    tasks.push({
      id: "task_photos",
      kind: "photos",
      weight: 80,
      href: "/products?filter=draft",
      label: {
        en:
          needPhotos.length === 1
            ? "Add photographs to 1 product"
            : `Add photographs to ${needPhotos.length} products`,
        az:
          needPhotos.length === 1
            ? "1 məhsula şəkil əlavə edin"
            : `${needPhotos.length} məhsula şəkil əlavə edin`,
      },
    });
  }

  const readyOrders = state.orders.filter((o) => o.stage === "ready");
  if (readyOrders.length > 0) {
    const order = readyOrders[0];
    tasks.push({
      id: "task_ready",
      kind: "order",
      weight: 70,
      href: `/orders/${order.id}`,
      label: {
        en: `Tell ${order.customerName} that order ${order.ref} is ready`,
        az: `${order.customerName} adlı şəxsə ${order.ref} sifarişinin hazır olduğunu bildirin`,
      },
    });
  }

  const unfinished = unfinishedProducts(state).filter((p) => p.images.length > 0);
  if (unfinished.length > 0) {
    const product = unfinished[0];
    tasks.push({
      id: `task_finish_${product.id}`,
      kind: "product",
      weight: 50,
      href: `/products/${product.id}`,
      label: {
        en: `Finish the listing for ${product.name.en}`,
        az: `${product.name.az} siyahısını tamamlayın`,
      },
    });
  }

  const lesson = nextLesson(state, member);
  if (lesson) {
    const title = lessonTitle(lesson.slug);
    tasks.push({
      id: "task_lesson",
      kind: "lesson",
      weight: 30,
      href: `/learn/${lesson.slug}`,
      label: {
        en: `Complete the lesson: ${title.en}`,
        az: `Dərsi tamamlayın: ${title.az}`,
      },
    });
  }

  return tasks.sort((a, b) => b.weight - a.weight);
}

/* -------------------------------------------------------------- storefront */

export function storeLanguages(state: AppState): Locale[] {
  return state.business.spokenLanguages.length > 0 ? state.business.spokenLanguages : ["en"];
}
