"use client";

import { EncyclopediaCategoryPage } from "@/components/world/encyclopedia-category-page";

export default function MagicPage() {
  return (
    <EncyclopediaCategoryPage
      category="magic"
      title="Magic Systems"
      description="Define how magic works in your world."
      createLabel="New Magic System"
      browseHref="/world/encyclopedia/magic"
      browseLabel="View all magic encyclopedia entries"
      emptyLabel="No magic systems defined yet."
      emptyActionLabel="Create your first magic system"
      builderTitle="Create Magic System"
      builderImport={() =>
        import("@/components/world/magic-builder").then((module) => ({
          default: module.MagicBuilder,
        }))
      }
      entryHref={(id) => `/world/encyclopedia/magic/${id}`}
      metadataLabel={(entry) =>
        typeof entry.metadata?.type === "string" ? String(entry.metadata.type) : null
      }
    />
  );
}
