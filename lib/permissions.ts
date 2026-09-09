import type { Role } from "./types";

/**
 * LoomLock's permission model.
 *
 * The point is family coordination, not surveillance. A collaborator is never
 * "blocked" from contributing — they are routed through the owner for the small
 * set of actions that are public-facing, financial, or hard to undo.
 *
 * Four outcomes:
 *   allowed         - do it directly
 *   needs_approval  - do it, but it queues for the owner before it takes effect
 *   suggest_only    - propose a value; the owner sets the real one
 *   unavailable     - the owner handles this
 */
export type PermissionLevel =
  | "allowed"
  | "needs_approval"
  | "suggest_only"
  | "unavailable";

export type PermissionAction =
  | "view_dashboard"
  | "add_product_draft"
  | "edit_product_draft"
  | "publish_product"
  | "draft_content"
  | "approve_content"
  | "update_order_stage"
  | "change_price"
  | "manage_members"
  | "view_financial_settings"
  | "assign_task"
  | "reply_to_customer"
  | "reset_demo";

const MATRIX: Record<PermissionAction, Record<Role, PermissionLevel>> = {
  view_dashboard: { owner: "allowed", collaborator: "allowed" },
  add_product_draft: { owner: "allowed", collaborator: "allowed" },
  edit_product_draft: { owner: "allowed", collaborator: "allowed" },
  publish_product: { owner: "allowed", collaborator: "needs_approval" },
  draft_content: { owner: "allowed", collaborator: "allowed" },
  approve_content: { owner: "allowed", collaborator: "unavailable" },
  update_order_stage: { owner: "allowed", collaborator: "allowed" },
  change_price: { owner: "allowed", collaborator: "suggest_only" },
  manage_members: { owner: "allowed", collaborator: "unavailable" },
  view_financial_settings: { owner: "allowed", collaborator: "unavailable" },
  assign_task: { owner: "allowed", collaborator: "allowed" },
  /** A reply that commits the business to a price or a date goes to the owner. */
  reply_to_customer: { owner: "allowed", collaborator: "needs_approval" },
  reset_demo: { owner: "allowed", collaborator: "allowed" },
};

export function permission(role: Role, action: PermissionAction): PermissionLevel {
  return MATRIX[action][role];
}

/** True when the role can trigger the action at all, with or without review. */
export function can(role: Role, action: PermissionAction): boolean {
  return permission(role, action) !== "unavailable";
}

/** True when the action takes effect immediately for this role. */
export function canDirectly(role: Role, action: PermissionAction): boolean {
  return permission(role, action) === "allowed";
}

/** True when the action is possible but routes through the owner first. */
export function needsApproval(role: Role, action: PermissionAction): boolean {
  const level = permission(role, action);
  return level === "needs_approval" || level === "suggest_only";
}

/**
 * The rows rendered on /team and /settings. Kept here so the table shown to
 * users and the logic enforced in the app can never drift apart.
 */
export const PERMISSION_TABLE: PermissionAction[] = [
  "view_dashboard",
  "add_product_draft",
  "edit_product_draft",
  "publish_product",
  "draft_content",
  "approve_content",
  "update_order_stage",
  "change_price",
  "manage_members",
  "view_financial_settings",
];
