export default function StatusTag({ available }: { available: boolean }) {
  return <span className={available ? "tag" : "tag out"}>{available ? "Available" : "Rented out"}</span>;
}
