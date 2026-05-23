"use client";

import { EncyclopediaCategoryPage } from "@/components/world/encyclopedia-category-page";

export default function LanguagePage() {
  return (
    <EncyclopediaCategoryPage
      category="language"
      title="Languages"
      description="Construct languages, phonologies, and scripts for your world."
      createLabel="New Language"
      browseHref="/world/encyclopedia/language"
      browseLabel="View all language encyclopedia entries"
      emptyLabel="No languages defined yet."
      emptyActionLabel="Create your first language"
      builderTitle="Create Language"
      builderImport={() =>
        import("@/components/world/language-builder").then((module) => ({
          default: module.LanguageBuilder,
        }))
      }
      entryHref={(id) => `/world/encyclopedia/language/${id}`}
    />
  );
}
