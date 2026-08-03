export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="font-heading text-3xl font-bold">{title}</h1>
      {description && <p className="mt-1 text-sm text-ink-dim">{description}</p>}
    </div>
  );
}
