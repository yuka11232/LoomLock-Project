import { cn } from "@/lib/utils";

export function Card({
  className,
  as: Tag = "div",
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "article" | "li" }) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-soft)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pt-5 pb-3 sm:px-6 sm:pt-6", className)} {...props} />;
}

export function CardTitle({
  className,
  as: Tag = "h2",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" | "h4" }) {
  return <Tag className={cn("text-lg font-semibold", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-stone", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5 sm:px-6 sm:pb-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-t border-line px-5 py-4 sm:px-6",
        className,
      )}
      {...props}
    />
  );
}

/** A section heading used above a group of cards. */
export function SectionHeading({
  title,
  description,
  action,
  id,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="text-xl font-semibold">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-stone">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
