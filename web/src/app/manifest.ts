import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StoryForge",
    short_name: "StoryForge",
    description: "Mental health-first writing and reading platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1021",
    theme_color: "#0f172a",
    orientation: "portrait",
    scope: "/",
    lang: "en",
    icons: [
      { src: "/pwa/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/pwa/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Open your writing dashboard",
        url: "/dashboard",
      },
      {
        name: "Library",
        short_name: "Library",
        description: "Open your saved reading list",
        url: "/library",
      },
      {
        name: "Install",
        short_name: "Install",
        description: "Install StoryForge on your home screen",
        url: "/download",
      },
    ],
  };
}
