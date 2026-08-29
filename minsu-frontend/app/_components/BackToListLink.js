import Link from "next/link";

export default function BackToListLink({ href, label, maxWidth = "1200px" }) {
  return (
    <div className="mx-auto w-full px-5 pb-1 pt-6 md:px-10" style={{ maxWidth }}>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 px-5 py-2.5 text-sm text-primary-900 transition hover:border-accent-700 hover:text-accent-700"
      >
        ← {label}
      </Link>
    </div>
  );
}
