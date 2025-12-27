export default function HomePage() {
  return (
      <main className="prose-lite mx-auto max-w-3xl px-6 py-10">
      <h1>StoryForge</h1>
          <p>
              A gamified writing platform that helps you build worlds, track
              characters and relationships, and share your stories with the right
              audience. Stay motivated with streaks, goals, and gems — all while
              protecting your wellbeing.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <a
                  className="bg-brand inline-flex items-center justify-center rounded-md px-4 py-2 font-medium text-white hover:brightness-110"
                  href="/signin"
              >
                  Sign in
              </a>
              <a
                  className="border-brand text-brand hover:bg-brand/10 inline-flex items-center justify-center rounded-md border px-4 py-2 font-medium"
                  href="/pricing"
              >
                  Pricing
              </a>
              <a
                  className="border-fg/20 hover:bg-fg/5 inline-flex items-center justify-center rounded-md border px-4 py-2 font-medium"
                  href="/feed"
              >
                  Public Feed
              </a>
          </div>

          <h2 className="mt-10">How it works</h2>
          <ul>
              <li>
                  Create projects and pick your preferred genre. Organize your story
                  into entities like Characters, Locations, Timelines, Dialogues, and
                  more.
              </li>
              <li>
                  Control visibility with privacy scopes: private, friends, public‑auth,
                  or public‑anyone.
              </li>
              <li>
                  Earn gems when you hit your goals and use them to customize your
                  experience or send gifts to friends.
              </li>
          </ul>

          <h2 className="mt-10">Try the basics</h2>
          <p>
              Explore our components and styling on the demo page, or browse the
              public feed to see sample stories shared by the community.
          </p>
          <div className="mt-4 flex gap-3">
              <a className="underline" href="/components-demo">
                  Components demo
              </a>
              <a className="underline" href="/feed">
                  Public feed
              </a>
          </div>
    </main>
  );
}
