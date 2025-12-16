export default function PricingPage() {
  return (
    <section style={{ maxWidth: 960, margin: "32px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Pricing</h1>
      <p style={{ color: "#374151", marginBottom: 12 }}>
        Start free and upgrade anytime. Pricing reflects the roadmap documented in docs.
      </p>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Free</h2>
          <p>3 active projects, basic tools, community features.</p>
          <div style={{ fontWeight: 800, marginTop: 8 }}>$0</div>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Premium</h2>
          <p>Unlimited projects, advanced tools, PDF/EPUB export, analytics.</p>
          <div style={{ fontWeight: 800, marginTop: 8 }}>$9.99/mo</div>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Team</h2>
          <p>Collaboration, advanced permissions, shared resources, team analytics.</p>
          <div style={{ fontWeight: 800, marginTop: 8 }}>$24.99/mo</div>
        </div>
      </div>
    </section>
  );
}
