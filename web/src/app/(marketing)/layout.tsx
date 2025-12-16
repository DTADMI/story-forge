import Link from "next/link";
import HeaderUser from "@/components/header/User";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid #e5e7eb"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ fontWeight: 800, color: "#0e3fa9" }}>StoryForge</Link>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link href="/" prefetch>Home</Link>
            <Link href="/feed" prefetch>Feed</Link>
            <Link href="/tutorial" prefetch>Tutorial</Link>
            <Link href="/pricing" prefetch>Pricing</Link>
          </nav>
        </div>
        <HeaderUser />
      </header>
      <main>{children}</main>
    </div>
  );
}
