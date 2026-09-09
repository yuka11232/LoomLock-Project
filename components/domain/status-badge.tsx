"use client";

import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  Globe,
  Hammer,
  MessageCircle,
  PackageCheck,
  PenLine,
  RotateCcw,
  Sparkles,
  Truck,
  XCircle,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import type {
  ApprovalStatus,
  ContentStatus,
  OrderStage,
  ProductStatus,
  StockStatus,
} from "@/lib/types";

type IconType = typeof Clock3;

/**
 * Status badges.
 *
 * Every badge is icon + word. Colour is a third signal, never the only one.
 */

const PRODUCT: Record<ProductStatus, { tone: BadgeTone; Icon: IconType }> = {
  draft: { tone: "draft", Icon: PenLine },
  in_review: { tone: "pending", Icon: Clock3 },
  public: { tone: "success", Icon: Globe },
};

export function ProductStatusBadge({ status, size }: { status: ProductStatus; size?: "sm" | "md" }) {
  const { d } = useI18n();
  const { tone, Icon } = PRODUCT[status];
  return (
    <Badge tone={tone} size={size}>
      <Icon aria-hidden />
      {d.status.product[status]}
    </Badge>
  );
}

const STOCK: Record<StockStatus, { tone: BadgeTone; Icon: IconType }> = {
  available: { tone: "success", Icon: PackageCheck },
  made_to_order: { tone: "info", Icon: Hammer },
  sold_out: { tone: "neutral", Icon: XCircle },
};

export function StockBadge({ status, size }: { status: StockStatus; size?: "sm" | "md" }) {
  const { d } = useI18n();
  const { tone, Icon } = STOCK[status];
  return (
    <Badge tone={tone} size={size}>
      <Icon aria-hidden />
      {d.status.stock[status]}
    </Badge>
  );
}

const CONTENT: Record<ContentStatus, { tone: BadgeTone; Icon: IconType }> = {
  draft: { tone: "draft", Icon: PenLine },
  in_review: { tone: "pending", Icon: Clock3 },
  approved: { tone: "success", Icon: CheckCircle2 },
  changes_requested: { tone: "attention", Icon: RotateCcw },
};

export function ContentStatusBadge({ status, size }: { status: ContentStatus; size?: "sm" | "md" }) {
  const { d } = useI18n();
  const { tone, Icon } = CONTENT[status];
  return (
    <Badge tone={tone} size={size}>
      <Icon aria-hidden />
      {d.status.content[status]}
    </Badge>
  );
}

export const STAGE_META: Record<OrderStage, { tone: BadgeTone; Icon: IconType }> = {
  new_enquiry: { tone: "attention", Icon: Sparkles },
  discussing: { tone: "info", Icon: MessageCircle },
  confirmed: { tone: "primary", Icon: CheckCircle2 },
  in_production: { tone: "draft", Icon: Hammer },
  ready: { tone: "pending", Icon: PackageCheck },
  delivered: { tone: "success", Icon: Truck },
};

export function OrderStageBadge({ stage, size }: { stage: OrderStage; size?: "sm" | "md" }) {
  const { d } = useI18n();
  const { tone, Icon } = STAGE_META[stage];
  return (
    <Badge tone={tone} size={size}>
      <Icon aria-hidden />
      {d.status.order[stage]}
    </Badge>
  );
}

const APPROVAL: Record<ApprovalStatus, { tone: BadgeTone; Icon: IconType }> = {
  pending: { tone: "pending", Icon: Clock3 },
  approved: { tone: "success", Icon: CheckCircle2 },
  returned: { tone: "attention", Icon: RotateCcw },
};

export function ApprovalStatusBadge({ status, size }: { status: ApprovalStatus; size?: "sm" | "md" }) {
  const { d } = useI18n();
  const { tone, Icon } = APPROVAL[status];
  return (
    <Badge tone={tone} size={size}>
      <Icon aria-hidden />
      {d.status.approval[status]}
    </Badge>
  );
}

/** Shown on a product card when the listing is not finished yet. */
export function IncompleteBadge({ label }: { label: string }) {
  return (
    <Badge tone="draft" size="sm">
      <CircleDashed aria-hidden />
      {label}
    </Badge>
  );
}
