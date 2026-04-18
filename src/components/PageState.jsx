export default function PageState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
      <h2 className="font-heading text-2xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-text-secondary">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
