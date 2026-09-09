/**
 * LoomLock domain types.
 *
 * Every user-visible string that belongs to *demo business content* (product
 * names, stories, order notes...) is stored as a `Localized` pair so the
 * language switcher changes the content, not just the chrome. Interface
 * strings live in lib/i18n/dictionary.ts instead.
 */

export type Locale = "en" | "az";

/** A piece of business content that exists in both interface languages. */
export type Localized = { en: string; az: string };

export type Role = "owner" | "collaborator";

/* ---------------------------------------------------------------- business */

export interface Business {
  id: string;
  slug: string;
  name: string;
  tagline: Localized;
  craft: Localized;
  story: Localized;
  location: Localized;
  foundedYear: number;
  contactEmail: string;
  /** Languages the family answers customers in. */
  spokenLanguages: Locale[];
  currency: "AZN";
  /** Shown on the storefront so customers know what to expect. */
  deliveryNote: Localized;
}

export interface Member {
  id: string;
  name: string;
  role: Role;
  /** How they describe their part in the business. */
  focus: Localized;
  responsibilities: Localized[];
  joinedAt: string;
  /** Used for the avatar chip; no photos of real people anywhere in LoomLock. */
  initials: string;
  /** Token name for the avatar colour. */
  accent: "pomegranate" | "indigo" | "clay" | "walnut";
}

/* --------------------------------------------------------------- products */

export type ProductStatus = "draft" | "in_review" | "public";
export type StockStatus = "available" | "made_to_order" | "sold_out";

export type ProductCategory =
  | "home_textiles"
  | "cushions"
  | "wall_pieces"
  | "small_gifts"
  | "accessories";

export type MotifName = "buta" | "lattice" | "pomegranate" | "stripe" | "medallion";
export type PaletteName = "pomegranate" | "indigo" | "clay" | "gold" | "sage";

/**
 * Product photography.
 *
 * `motif` images are procedurally drawn textile swatches used for demo data.
 * They are honest placeholders and are labelled as such; they are never
 * presented as real photographs of the work.
 *
 * `upload` images are real files the family added, downscaled in the browser
 * and stored as data URLs so the demo survives a page refresh.
 */
export interface ProductImage {
  id: string;
  kind: "motif" | "upload";
  /** For motif images: which woven pattern to draw. */
  motif?: MotifName;
  /** For motif images: palette key. */
  palette?: PaletteName;
  /** For uploaded images: a downscaled data URL. */
  dataUrl?: string;
  alt: Localized;
  isCover: boolean;
}

export interface Product {
  id: string;
  name: Localized;
  category: ProductCategory;
  description: Localized;
  /** The artisan's own account of the piece. */
  story: Localized;
  /** Null when the family prefers "price on request". */
  price: number | null;
  priceOnRequest: boolean;
  productionDays: number | null;
  materials: Localized[];
  dimensions: string;
  stockStatus: StockStatus;
  madeToOrder: boolean;
  status: ProductStatus;
  images: ProductImage[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  /** Appended to on every submit / approve / return. */
  history: ProductHistoryEntry[];
}

export interface ProductHistoryEntry {
  id: string;
  at: string;
  actorId: string;
  kind: "created" | "updated" | "submitted" | "approved" | "returned" | "unpublished";
  note?: string;
}

/* ---------------------------------------------------------------- content */

export type ContentGoal = "introduce" | "story" | "availability" | "process";
export type ContentTone = "warm" | "informative" | "simple" | "story";
export type ContentPlatform = "instagram" | "facebook" | "note";
export type ContentStatus = "draft" | "in_review" | "approved" | "changes_requested";

export interface ContentDraft {
  id: string;
  productId: string;
  goal: ContentGoal;
  tone: ContentTone;
  platform: ContentPlatform;
  /** Written by the family. LoomLock only ever offers a starter scaffold. */
  caption: string;
  hashtags: string[];
  status: ContentStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  /** The owner's note when they send a draft back for a change. */
  reviewNote?: string;
  /** Which language the caption was written in. */
  language: Locale;
}

/* --------------------------------------------------------------- approvals */

export type ApprovalType =
  | "product_publish"
  | "content_publish"
  | "price_change"
  | "customer_reply";

export type ApprovalStatus = "pending" | "approved" | "returned";

export interface Approval {
  id: string;
  type: ApprovalType;
  targetId: string;
  title: Localized;
  summary: Localized;
  requestedBy: string;
  requestedAt: string;
  status: ApprovalStatus;
  decidedBy?: string;
  decidedAt?: string;
  reviewNote?: string;
  /** Type-specific detail rendered by the approval card. */
  payload?: {
    fromPrice?: number | null;
    toPrice?: number | null;
    orderId?: string;
    message?: string;
    reason?: string;
  };
}

/* ----------------------------------------------------------------- orders */

export type OrderStage =
  | "new_enquiry"
  | "discussing"
  | "confirmed"
  | "in_production"
  | "ready"
  | "delivered";

export const ORDER_STAGES: OrderStage[] = [
  "new_enquiry",
  "discussing",
  "confirmed",
  "in_production",
  "ready",
  "delivered",
];

export type OrderSource = "storefront" | "instagram" | "in_person" | "referral";

export interface OrderNote {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  kind: "note" | "message_sent" | "stage_change";
}

export interface Order {
  id: string;
  ref: string;
  customerName: string;
  customerContact: string;
  productId: string | null;
  requestedItem: Localized;
  quantity: number;
  createdAt: string;
  /** What the customer asked for, in their words. */
  enquiry: Localized;
  dueDate: string | null;
  stage: OrderStage;
  assigneeId: string | null;
  nextAction: Localized;
  source: OrderSource;
  agreedPrice: number | null;
  notes: OrderNote[];
}

/* --------------------------------------------------------------- learning */

export type LessonCategory =
  | "photography"
  | "storytelling"
  | "pricing"
  | "customers"
  | "orders"
  | "money"
  | "privacy"
  | "safety"
  | "culture"
  | "teamwork";

export interface Lesson {
  slug: string;
  category: LessonCategory;
  title: Localized;
  /** One line shown on the lesson card. */
  summary: Localized;
  minutes: number;
  /** Which roles LoomLock suggests this to first. Both roles may open any lesson. */
  suggestedFor: Role[];
  /** The short explanation, as paragraphs. */
  explanation: Localized[];
  /** One concrete real-world example. */
  example: { title: Localized; body: Localized };
  /** One small action the learner actually does. */
  action: { prompt: Localized; placeholder: Localized };
  /** A closing line tying the lesson back to the family workspace. */
  takeaway: Localized;
}

export interface LessonProgress {
  lessonSlug: string;
  memberId: string;
  completedAt: string;
  /** What the learner wrote when they did the action. */
  actionNote: string;
}

/* --------------------------------------------------------------- activity */

export type ActivityKind =
  | "product_created"
  | "product_updated"
  | "product_submitted"
  | "product_approved"
  | "product_returned"
  | "content_created"
  | "content_submitted"
  | "content_approved"
  | "content_returned"
  | "order_created"
  | "order_stage_changed"
  | "order_assigned"
  | "order_note"
  | "price_suggested"
  | "price_changed"
  | "lesson_completed"
  | "member_invited"
  | "enquiry_received";

export interface ActivityEvent {
  id: string;
  at: string;
  actorId: string;
  kind: ActivityKind;
  summary: Localized;
  entity?: { type: "product" | "content" | "order" | "lesson" | "member"; id: string };
}

/* ------------------------------------------------------------ invitations */

export interface Invitation {
  id: string;
  name: string;
  contact: string;
  role: Role;
  invitedBy: string;
  invitedAt: string;
  status: "pending" | "accepted";
}

/* ----------------------------------------------------------- app settings */

export interface AppSettings {
  locale: Locale;
  /** Which demo role the visitor is currently using. */
  activeMemberId: string;
  /** Notification preferences. Local to the demo. */
  notify: {
    newEnquiries: boolean;
    approvalRequests: boolean;
    weeklyLearning: boolean;
  };
  /** Whether the visitor has finished /onboarding at least once. */
  onboardingComplete: boolean;
}

/* ------------------------------------------------------------- root state */

export interface AppState {
  /** Bumped when the seed shape changes so old saves are re-seeded. */
  version: number;
  business: Business;
  members: Member[];
  products: Product[];
  contentDrafts: ContentDraft[];
  approvals: Approval[];
  orders: Order[];
  lessonProgress: LessonProgress[];
  activity: ActivityEvent[];
  invitations: Invitation[];
  settings: AppSettings;
}
