import { crc32 } from "./crc32";

interface EpubEntry {
  name: string;
  data: Buffer;
}

function buildZip(entries: EpubEntry[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, "utf-8");
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt32LE(entry.name === "mimetype" ? 0xffffffff : crc, 14);
    localHeader.writeUInt32LE(size, 18);
    localHeader.writeUInt32LE(size, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuf.copy(localHeader, 30);

    const centralHeader = Buffer.alloc(46 + nameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt32LE(entry.name === "mimetype" ? 0xffffffff : crc, 16);
    centralHeader.writeUInt32LE(size, 20);
    centralHeader.writeUInt32LE(size, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt32LE(0, 36);
    centralHeader.writeUInt32LE(offset, 42);
    nameBuf.copy(centralHeader, 46);

    localHeaders.push(localHeader, entry.data);
    centralHeaders.push(centralHeader);
    offset += localHeader.length + size;
  }

  const centralDirStart = offset;
  const centralDirSize = centralHeaders.reduce((sum, h) => sum + h.length, 0);
  const totalEntries = entries.length;

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(totalEntries, 8);
  eocd.writeUInt16LE(totalEntries, 10);
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(centralDirStart, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHtmlKeepText(html: string): string {
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

function wrapChapterXhtml(body: string, title: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${escapeXml(title)}</title>
  <meta charset="utf-8" />
  <link rel="stylesheet" type="text/css" href="style.css" />
</head>
<body>
  <section class="chapter">
    <h1>${escapeXml(title)}</h1>
    ${body}
  </section>
</body>
</html>`;
}

function wrapCoverXhtml(title: string, author: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Cover</title>
  <meta charset="utf-8" />
  <link rel="stylesheet" type="text/css" href="style.css" />
</head>
<body class="cover">
  <div class="cover-container">
    <h1 class="cover-title">${escapeXml(title)}</h1>
    <p class="cover-author">by ${escapeXml(author)}</p>
  </div>
</body>
</html>`;
}

function wrapNavXhtml(title: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Table of Contents</title>
  <meta charset="utf-8" />
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      <li><a href="cover.xhtml">Cover</a></li>
      <li><a href="chapter.xhtml">${escapeXml(title)}</a></li>
    </ol>
  </nav>
</body>
</html>`;
}

const EPUB_CSS = `@namespace epub "http://www.idpf.org/2007/ops";

body {
  font-family: Georgia, "Times New Roman", serif;
  line-height: 1.6;
  margin: 5%;
  color: #1a1a1a;
}

h1 {
  font-size: 1.8em;
  margin-bottom: 1em;
  text-align: center;
}

p {
  margin: 0 0 0.8em 0;
  text-indent: 1.5em;
}

p:first-of-type {
  text-indent: 0;
}

body.cover {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  page-break-after: always;
}

.cover-container {
  text-align: center;
}

.cover-title {
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 0.5em;
  text-indent: 0;
}

.cover-author {
  font-size: 1.2em;
  color: #555;
  text-indent: 0;
}

.chapter h1 {
  margin-top: 2em;
  margin-bottom: 1.5em;
}
`;

export interface EpubInput {
  title: string;
  author: string;
  content: string;
  language?: string;
}

export function generateEpub(input: EpubInput): Buffer {
  const title = input.title || "Untitled";
  const author = input.author || "Anonymous";
  const lang = input.language || "en";
  const uuid = crypto.randomUUID();
  const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");

  const bodyContent = stripHtmlKeepText(input.content)
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      const escaped = escapeXml(trimmed);

      if (trimmed.startsWith("# ")) return `<h2>${escaped.slice(2)}</h2>`;
      if (trimmed.startsWith("## ")) return `<h3>${escaped.slice(3)}</h3>`;
      return `<p>${escaped || "&#160;"}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  const chapterXhtml = wrapChapterXhtml(bodyContent, title);
  const coverXhtml = wrapCoverXhtml(title, author);
  const navXhtml = wrapNavXhtml(title);

  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" />
  </rootfiles>
</container>`;

  const opfContent = `<?xml version="1.0" encoding="UTF-8"?>
<package version="3.0" unique-identifier="book-id" xmlns="http://www.idpf.org/2007/opf">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">urn:uuid:${uuid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:language>${escapeXml(lang)}</dc:language>
    <dc:date>${now}</dc:date>
    <meta property="dcterms:modified">${now}</meta>
  </metadata>
  <manifest>
    <item id="style" href="style.css" media-type="text/css" />
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml" />
    <item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml" />
  </manifest>
  <spine>
    <itemref idref="cover" linear="yes" />
    <itemref idref="nav" linear="no" />
    <itemref idref="chapter" linear="yes" />
  </spine>
</package>`;

  const entries: EpubEntry[] = [
    {
      name: "mimetype",
      data: Buffer.from("application/epub+zip", "utf-8"),
    },
    {
      name: "META-INF/container.xml",
      data: Buffer.from(containerXml, "utf-8"),
    },
    {
      name: "OEBPS/content.opf",
      data: Buffer.from(opfContent, "utf-8"),
    },
    {
      name: "OEBPS/style.css",
      data: Buffer.from(EPUB_CSS, "utf-8"),
    },
    {
      name: "OEBPS/nav.xhtml",
      data: Buffer.from(navXhtml, "utf-8"),
    },
    {
      name: "OEBPS/cover.xhtml",
      data: Buffer.from(coverXhtml, "utf-8"),
    },
    {
      name: "OEBPS/chapter.xhtml",
      data: Buffer.from(chapterXhtml, "utf-8"),
    },
  ];

  return buildZip(entries);
}
