export default function TutorialPage() {
  return (
      <section style={{maxWidth: 960, margin: '32px auto', padding: '0 16px'}}>
          <h1 style={{fontSize: 32, fontWeight: 800, marginBottom: 12}}>
              Getting Started
          </h1>
          <p style={{color: '#374151', marginBottom: 12}}>
              StoryForge helps you build worlds, track characters and relationships,
              and stay motivated with goals and streaks. This tutorial will guide you
              through the basics.
      </p>
      <ol style={{ lineHeight: 1.8 }}>
        <li>1) Create an account or use the demo credentials.</li>
        <li>2) Explore the public feed to see example projects.</li>
        <li>3) Sign in to create your first project and set its visibility.</li>
          <li>
              4) Add characters and begin drafting with the editor (coming in next
              steps).
          </li>
      </ol>
    </section>
  );
}
