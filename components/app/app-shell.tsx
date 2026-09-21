"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardCheck,
  ExternalLink,
  LayoutDashboard,
  Megaphone,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Note } from "@/components/ui/note";
import { useStore } from "@/lib/data/store";
import { newEnquiries, pendingApprovals } from "@/lib/data/selectors";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";
import { RoleSwitcher } from "./role-switcher";
import { Wordmark } from "./logo";

/**
 * The workspace shell.
 *
 * Desktop gets a persistent sidebar; small screens get the same list in a
 * drawer, because a family running a business from a phone should reach every
 * area in one tap. The drawer closes on navigation and on Escape.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, me, storageError, dismissStorageError } = useStore();
  const { d } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // A route change means the drawer has done its job.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const approvalCount = pendingApprovals(state).length;
  const enquiryCount = newEnquiries(state).length;

  const items = [
    { href: "/dashboard", label: d.nav.dashboard, Icon: LayoutDashboard },
    { href: "/products", label: d.nav.products, Icon: Package },
    { href: "/content", label: d.nav.content, Icon: Megaphone },
    { href: "/orders", label: d.nav.orders, Icon: ShoppingBag, count: enquiryCount },
    {
      href: "/approvals",
      label: d.nav.approvals,
      Icon: ClipboardCheck,
      // The collaborator sees the queue, but the count is the owner's workload.
      count: me.role === "owner" ? approvalCount : undefined,
    },
    { href: "/learn", label: d.nav.learn, Icon: BookOpen },
    { href: "/team", label: d.nav.team, Icon: Users },
    { href: "/settings", label: d.nav.settings, Icon: Settings },
  ];

  const nav = (
    <nav aria-label={d.nav.mainMenu} className="flex flex-col gap-0.5">
      {items.map(({ href, label, Icon, count }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-[var(--radius-field)] px-3 text-[0.9375rem] transition-colors",
              active
                ? "bg-pomegranate-100 font-semibold text-pomegranate-600"
                : "text-charcoal hover:bg-surface-sunk",
            )}
          >
            <Icon aria-hidden className="size-[18px] shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            {count ? (
              <span className="min-w-5 rounded-[0.25rem] bg-pomegranate px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums text-white">
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}

      <div className="thread-rule my-2.5" aria-hidden />

      <Link
        href={`/store/${state.business.slug}`}
        className="flex min-h-11 items-center gap-3 rounded-[var(--radius-field)] px-3 text-[0.9375rem] text-stone transition-colors hover:bg-surface-sunk hover:text-charcoal"
      >
        <ExternalLink aria-hidden className="size-[18px] shrink-0" />
        <span className="flex-1 truncate">{d.nav.storefront}</span>
      </Link>
    </nav>
  );

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main" className="skip-link">
        {d.nav.skipToContent}
      </a>

      {/* ------------------------------------------------------------ header */}
      <header className="sticky top-0 z-30 border-b border-line bg-ivory/90 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label={d.nav.openMenu}
            aria-expanded={menuOpen}
          >
            <Menu aria-hidden />
          </Button>

          <Link href="/dashboard" className="shrink-0">
            <Wordmark />
            <span className="sr-only">{d.nav.dashboard}</span>
          </Link>

          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher compact />
            <RoleSwitcher className="hidden w-56 sm:block" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ---------------------------------------------------------- sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 overflow-y-auto border-e border-line bg-ivory px-3 py-5 lg:block">
          {nav}
        </aside>

        {/* ----------------------------------------------------- mobile drawer */}
        {menuOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-charcoal/40 animate-fade-in"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={d.nav.mainMenu}
              className="relative flex h-full w-[min(19rem,85vw)] animate-fade-in flex-col overflow-y-auto border-e border-line bg-ivory p-4 shadow-[var(--shadow-lift)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <Wordmark />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMenuOpen(false)}
                  aria-label={d.nav.closeMenu}
                  autoFocus
                >
                  <X aria-hidden />
                </Button>
              </div>
              <RoleSwitcher className="mb-4 sm:hidden" />
              {nav}
            </div>
          </div>
        ) : null}

        {/* ------------------------------------------------------------- main */}
        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {storageError ? (
            <Note tone="caution" className="mb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>{d.errors.storageFull}</span>
                <Button variant="outline" size="sm" onClick={dismissStorageError}>
                  {d.common.dismiss}
                </Button>
              </div>
            </Note>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}

/** The standard page heading inside the shell. */
export function PageHeader({
  title,
  description,
  action,
  breadcrumb,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {breadcrumb ? <div className="mb-2">{breadcrumb}</div> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-[0.9375rem] text-stone">{description}</p>
          ) : null}
        </div>
        {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
      </div>
    </div>
  );
}
