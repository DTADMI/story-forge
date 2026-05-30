import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isEnabled } from "@/lib/flags-server";
import { notFound } from "@/lib/error-response";
import { generateEpub } from "@/lib/export-epub";
import { generatePdfHtml } from "@/lib/export-pdf";

function htmlToMarkdown(html: string): string {
  let md = html;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n");
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "\n$1\n");
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
  md = md.replace(/<ul[^>]*>/gi, "\n");
  md = md.replace(/<\/ul>/gi, "\n");
  md = md.replace(/<ol[^>]*>/gi, "\n");
  md = md.replace(/<\/ol>/gi, "\n");
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n");
  md = md.replace(/\n{3,}/g, "\n\n");
  return md.trim();
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isEnabled("export"))) {
    return NextResponse.json({ error: "Feature disabled" }, { status: 404 });
  }
  const user = await requireUser();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      OR: [{ userId: user.id }, { collaborators: { some: { userId: user.id } } }],
    },
  });
  if (!project) return notFound("Project not found");

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");

  const safeFilename = project.title.replace(/[^a-zA-Z0-9_-]/g, "_");
  const author = user.email || "Anonymous";

  if (format === "epub") {
    const epubBuffer = generateEpub({
      title: project.title,
      author,
      content: project.content || "",
    });

    return new NextResponse(new Uint8Array(epubBuffer), {
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": `attachment; filename="${safeFilename}.epub"`,
      },
    });
  }

  if (format === "pdf") {
    const pdfHtml = generatePdfHtml(project.content || "", project.title, author);

    return new NextResponse(pdfHtml, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}.pdf"`,
      },
    });
  }

  const mdContent = htmlToMarkdown(project.content || "");
  const markdown = `# ${project.title}\n\n> By ${author} | ${project.wordCount} words\n\n${mdContent}`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFilename}.md"`,
    },
  });
}
