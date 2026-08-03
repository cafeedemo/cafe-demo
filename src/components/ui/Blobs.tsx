export function Blobs() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-pink/10 blur-[110px]" />
      <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-purple/10 blur-[110px]" />
      <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-orange/10 blur-[110px]" />
    </div>
  );
}
