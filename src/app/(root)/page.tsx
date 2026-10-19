import Link from 'next/link';

export default function RootPage() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <p>
        Redirecting to <Link href="/en">English</Link> / <Link href="/fr">Français</Link>...
      </p>
    </main>
  );
}
