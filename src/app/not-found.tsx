import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <span>404</span>
      <h1>This planet drifted out of orbit.</h1>
      <Link href="/">Generate another planet</Link>
    </main>
  );
}
