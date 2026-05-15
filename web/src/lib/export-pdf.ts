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
    @page {
      size: A4;
      margin: 2cm;
      @bottom-center {
        content: counter(page);
        font-size: 9pt;
        font-family: Georgia, serif;
        color: #999;
      }
    }
    body {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 100%;
    }
    .cover-page {
      page-break-after: always;
      text-align: center;
      padding-top: 30%;
    }
    .cover-title {
      font-size: 28pt;
      font-weight: bold;
      margin-bottom: 0.5em;
    }
    .cover-author {
      font-size: 14pt;
      color: #555;
    }
    .chapter {
      page-break-before: always;
    }
    h1, h2, h3 {
      page-break-after: avoid;
    }
    p {
      text-indent: 1.5em;
      margin: 0 0 0.6em 0;
      orphans: 2;
      widows: 2;
    }
    p:first-of-type {
      text-indent: 0;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="cover-page">
    <h1 class="cover-title">${safeTitle}</h1>
    <p class="cover-author">by ${safeAuthor}</p>
  </div>
  <div class="chapter">
    ${bodyContent}
  </div>
</body>
</html>`;
}

export function generatePdfBuffer(_htmlContent: string, _title: string, _author: string): string {
  return generatePdfHtml(_htmlContent, _title, _author);
}
