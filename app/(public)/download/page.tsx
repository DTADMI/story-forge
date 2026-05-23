import { Card } from "@/components/ui/card";

export default function DownloadPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Download</h1>
          <p className="mt-2 text-muted-foreground">
            Export your work and access StoryForge anywhere.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-16 space-y-6">
        <Card className="p-6">
          <h2 className="font-display font-semibold">Project Export</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            From any project editor, use the Export dropdown to download your work as Markdown,
            EPUB, or PDF. Your data is always portable.
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="font-display font-semibold">Mobile App</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            StoryForge is a Progressive Web App. Install it on your device by visiting the website
            and tapping &ldquo;Add to Home Screen&rdquo; from the browser menu.
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="font-display font-semibold">Offline Mode</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The PWA includes offline support. Your last visited pages are cached and accessible
            without an internet connection.
          </p>
        </Card>
      </section>
    </div>
  );
}
