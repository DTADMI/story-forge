export function generatePdfHtml(htmlContent: string, title: string, author: string): string {
  const safeTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const safeAuthor = author
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const bodyContent = htmlContent
    .replace(/<(h1|h2|h3|h4|h5|h6)[^>]*>/gi, "<$1>")
    .replace(/<(p|li)[^>]*>/gi, "<$1>")
    .replace(/<br\s*\/?>/gi, "<br>")
    .replace(/<hr\s*\/?>/gi, "<hr>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>
    @page { size: A4; margin: 2cm; @bottom-center { content: counter(page); font-size: 9pt; font-family: Georgia, serif; color: #999; } }
    body { font-family: Georgia, "Times New Roman", serif; font-size: 12pt; line-height: 1.6; color: #1a1a1a; max-width: 100%; }
    .cover-page { page-break-after: always; text-align: center; padding-top: 30%; }
    .cover-title { font-size: 28pt; font-weight: bold; margin-bottom: 0.5em; }
    .cover-author { font-size: 14pt; color: #555; }
    .chapter { page-break-before: always; }
    h1, h2, h3 { page-break-after: avoid; }
    p { text-indent: 1.5em; margin: 0 0 0.6em 0; orphans: 2; widows: 2; }
    p:first-of-type { text-indent: 0; }
    @media print { body { -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="cover-page"><h1 class="cover-title">${safeTitle}</h1><p class="cover-author">by ${safeAuthor}</p></div>
  <div class="chapter">${bodyContent}</div>
</body>
</html>`;
}

function stripHtmlPlainText(html: string): string {
  return html
    .replace(/<(p|h[1-6]|li|br|div)[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapePdfString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r/g, "")
    .replace(/\t/g, "    ");
}

export function generatePdfBuffer(htmlContent: string, title: string, author: string): Buffer {
  const safeTitle = escapePdfString(title || "Untitled");
  const safeAuthor = escapePdfString(author || "Anonymous");
  const plainText = stripHtmlPlainText(htmlContent);

  const margin = 56.7; // 2cm in points (72pt/inch)
  const pageWidth = 595; // A4 width
  const pageHeight = 842; // A4 height
  const bodyWidth = pageWidth - margin * 2;
  const fontSize = 11;

  // Split text into lines that fit within bodyWidth (rough: ~12 chars/inch at 11pt)
  const charsPerLine = Math.floor((bodyWidth / 72) * 12);
  const linesPerPage = Math.floor((pageHeight - margin * 2) / (fontSize * 1.6));

  const paragraphs = plainText.split("\n").filter((l) => l.trim().length > 0);
  const wrappedLines: string[] = [];

  // Title page
  wrappedLines.push("");
  wrappedLines.push(title);
  wrappedLines.push(`by ${author}`);
  wrappedLines.push("");
  wrappedLines.push("");

  // Split paragraphs into wrapped lines
  for (const para of paragraphs) {
    const words = para.split(" ");
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length > charsPerLine && currentLine.length > 0) {
        wrappedLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      wrappedLines.push(currentLine);
    }
    wrappedLines.push(""); // paragraph break
  }

  // Paginate
  const pages: string[][] = [];
  let page: string[] = [];
  for (const line of wrappedLines) {
    page.push(escapePdfString(line));
    if (page.length >= linesPerPage) {
      pages.push(page);
      page = [];
    }
  }
  if (page.length > 0) pages.push(page);

  // Build cross-reference table
  const catalogNum = 1;
  const pagesNum = 2;
  const fontNum = 3;

  let objNum = fontNum + 1;

  // Build page objects
  const pageObjNums: number[] = [];
  const pageContents: string[] = [];

  for (const pageLines of pages) {
    const pageObjNum = objNum++;
    const contentObjNum = objNum++;

    pageObjNums.push(pageObjNum);

    // Build content stream
    let stream = "BT\n";
    stream += `/F1 ${fontSize} Tf\n`;
    stream += `${margin} ${pageHeight - margin - 14} Td\n`;
    stream += `${11 * 1.6} TL\n`;

    let y = 0;
    for (const line of pageLines) {
      if (y < linesPerPage) {
        stream += `(${line}) '\n`;
        y++;
      }
    }
    stream += "ET\n";

    pageContents.push(
      `${contentObjNum} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj`
    );

    pageContents.push(
      `${pageObjNum} 0 obj\n<< /Type /Page /Parent ${pagesNum} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjNum} 0 R /Resources << /Font << /F1 ${fontNum} 0 R >> >> >>\nendobj`
    );
  }

  // Build kids array
  const kidsRefs = pageObjNums.map((n) => `${n} 0 R`).join(" ");

  // Build the PDF with proper xref table
  const pdfLines: string[] = [];

  pdfLines.push("%PDF-1.4");
  pdfLines.push("%\xE2\xE3\xCF\xD3"); // binary comment for PDF/A

  // Catalog
  pdfLines.push(`${catalogNum} 0 obj`);
  pdfLines.push("<< /Type /Catalog /Pages 2 0 R >>");
  pdfLines.push("endobj");

  // Pages tree
  pdfLines.push(`${pagesNum} 0 obj`);
  pdfLines.push(`<< /Type /Pages /Kids [${kidsRefs}] /Count ${pageObjNums.length} >>`);
  pdfLines.push("endobj");

  // Font
  pdfLines.push(`${fontNum} 0 obj`);
  pdfLines.push("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");
  pdfLines.push("endobj");

  // Page objects and content streams
  for (const pc of pageContents) {
    pdfLines.push(pc);
  }

  // Build xref table
  const offsets: number[] = [];
  let offset = 0;
  for (const line of pdfLines) {
    offsets.push(offset);
    offset += line.length + 1;
  }

  const xrefOffset = offset;
  const totalObjects = objNum;

  pdfLines.push("xref");
  pdfLines.push(`0 ${totalObjects}`);
  pdfLines.push("0000000000 65535 f ");
  for (let i = 0; i < offsets.length; i++) {
    pdfLines.push(`${String(offsets[i]).padStart(10, "0")} 00000 n `);
  }

  pdfLines.push("trailer");
  pdfLines.push(`<< /Size ${totalObjects} /Root 1 0 R >>`);
  pdfLines.push("startxref");
  pdfLines.push(String(xrefOffset));
  pdfLines.push("%%EOF");

  return Buffer.from(pdfLines.join("\n"), "ascii");
}
