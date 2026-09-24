/** HUD-style section marker: index, diagonal tick, label. */
export function SectionLabel({
  index,
  children,
  className = "",
}: {
  index: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`flex items-center gap-3 hud text-muted ${className}`}>
      <span className="text-green-ink">{index}</span>
      <span aria-hidden="true" className="h-3 w-px rotate-[20deg] bg-line-strong" />
      <span>{children}</span>
    </p>
  );
}
