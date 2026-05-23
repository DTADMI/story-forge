"use client";

import { EncyclopediaCategoryPage } from "@/components/world/encyclopedia-category-page";

export default function ReligionPage() {
  return (
    <EncyclopediaCategoryPage
      category="religion"
      title="Religions & Beliefs"
      description="Define the religions, deities, and belief systems in your world."
      createLabel="New Religion"
      browseHref="/world/encyclopedia/religion"
      browseLabel="View all religion encyclopedia entries"
      emptyLabel="No religions defined yet."
      emptyActionLabel="Create your first religion"
      builderTitle="Create Religion"
      builderImport={() =>
        import("@/components/world/religion-builder").then((module) => ({
          default: module.ReligionBuilder,
        }))
      }
      entryHref={(id) => `/world/encyclopedia/religion/${id}`}
    />
  );
}
