/** Marks content that must be replaced with real GRYOX information before launch. */
export function PlaceholderBadge({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 border border-dashed border-line-strong px-2.5 py-1 hud text-[0.6rem] text-faint ${className}`}
      title={label}
    >
      <span aria-hidden="true" className="size-1.5 bg-purple-ink" />
      {label}
    </span>
  );
}
