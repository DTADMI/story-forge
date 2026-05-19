import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@storyforge.app";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo Author",
      username: "demo",
      bio: "Demo account for StoryForge",
    },
  });

  await prisma.project.upsert({
    where: { id: "seed-public-project" },
    update: {},
    create: {
      id: "seed-public-project",
      userId: user.id,
      title: "The Royal Journey",
      description: "A sample public story to populate the feed.",
      isPublic: true,
      defaultScope: "PUBLIC_ANYONE",
    },
  });

  console.log("Seed completed. Demo user:", { email });
  console.log(
    "Note: Supabase Auth handles authentication. Create the demo user via Supabase dashboard or API."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
