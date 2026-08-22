#!/usr/bin/env node
// =============================================================================
// StoryForge — Page-by-Page Feature Audit Script
// Scans all pages/routes and reports what features are present on each.
//
// Usage: node scripts/audit-pages.mjs
// =============================================================================

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const APP_DIR = join(ROOT, 'app');

// ── Discover Pages ─────────────────────────────────────────────────────────

function discoverPages(dir, basePath = '') {
  const pages = [];
  if (!existsSync(dir)) return pages;

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (entry.startsWith('_') || entry.startsWith('.') || entry === 'node_modules') continue;

    try {
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        // Route group: (name)
        if (entry.startsWith('(') && entry.endsWith(')')) {
          pages.push(...discoverPages(fullPath, basePath));
        } else {
          pages.push(...discoverPages(fullPath, join(basePath, entry).replace(/\\/g, '/')));
        }
      } else if (entry === 'page.tsx' || entry === 'page.ts') {
        pages.push({
          route: basePath || '/',
          file: join(basePath, entry).replace(/\\/g, '/'),
          fullPath,
        });
      }
    } catch {}
  }

  return pages;
}

// ── Analyze Page Features ─────────────────────────────────────────────────

function analyzePage(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const features = {
    hasForm: false,
    hasAuth: false,
    hasAI: false,
    hasCollaboration: false,
    hasStripe: false,
    hasSupabase: false,
    hasI18n: false,
    isServerComponent: false,
    isClientComponent: false,
    hasSuspense: false,
    hasErrorBoundary: false,
    hasLoadingState: false,
    dataFetching: 'none',
  };

  // Pattern matching
  features.hasForm = /<(?:form|Form|input|Input)/i.test(content) || /react-hook-form|useForm/.test(content);
  features.hasAuth = /auth|signin|signup|login|logout|cookie/i.test(content);
  features.hasAI = /ai|openai|openrouter|deepseek|generate|completion/i.test(content);
  features.hasCollaboration = /yjs|websocket|collaborat|sync/i.test(content);
  features.hasStripe = /stripe|checkout|payment|subscription/i.test(content);
  features.hasSupabase = /supabase|createClient/i.test(content);
  features.hasI18n = /useI18n|useTranslation|t\(|locale/i.test(content);
  features.isServerComponent = !content.includes("'use client'") && !content.includes('"use client"');
  features.isClientComponent = content.includes("'use client'") || content.includes('"use client"');
  features.hasSuspense = /Suspense|suspense/i.test(content);
  features.hasErrorBoundary = /ErrorBoundary|error\.tsx|error\.ts/i.test(content);
  features.hasLoadingState = /loading\.tsx|loading\.ts|Loading|Skeleton/i.test(content);

  // Data fetching
  if (/getServerSideProps|generateStaticParams|generateMetadata|fetch\(|useQuery/i.test(content)) {
    features.dataFetching = 'server';
  }
  if (/useSWR|useQuery|useEffect.*fetch|useState.*fetch/i.test(content)) {
    features.dataFetching = 'client';
  }

  return features;
}

// ── i18n Coverage ─────────────────────────────────────────────────────────

function checkI18nCoverage(pages) {
  const withI18n = pages.filter(p => p.features.hasI18n);
  const missingI18n = pages.filter(p => !p.features.hasI18n && !p.route.startsWith('/api'));

  console.log(`\n📚 i18n Coverage:`);
  console.log(`  Pages with i18n: ${withI18n.length}/${pages.length}`);
  console.log(`  Missing i18n: ${missingI18n.length}`);

  if (missingI18n.length > 0) {
    console.log('\n  Pages without i18n:');
    for (const p of missingI18n.slice(0, 10)) {
      console.log(`    - ${p.route}`);
    }
    if (missingI18n.length > 10) {
      console.log(`    ... and ${missingI18n.length - 10} more`);
    }
  }
}

// ── Report ────────────────────────────────────────────────────────────────

function generateReport(pages) {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  StoryForge — Page-by-Page Feature Audit     ');
  console.log('═══════════════════════════════════════════════\n');

  console.log(`Total pages discovered: ${pages.length}\n`);

  // Table header
  console.log('Route'.padEnd(30) + 'Form  Auth  AI   Collab Stripe Supa  i18n  DataFetch');
  console.log('-'.repeat(90));

  for (const page of pages) {
    const f = page.features;
    const row = [
      page.route.slice(0, 28).padEnd(28),
      f.hasForm ? '✅' : '  ',
      f.hasAuth ? '🔐' : '  ',
      f.hasAI ? '🤖' : '  ',
      f.hasCollaboration ? '👥' : '  ',
      f.hasStripe ? '💳' : '  ',
      f.hasSupabase ? '⚡' : '  ',
      f.hasI18n ? '🌐' : '  ',
    ].join('  ');
    console.log(row + '  ' + f.dataFetching);
  }

  // Summary
  console.log('\n─────────────────────────────────────────────');
  console.log('Feature Summary:');
  console.log(`  Pages with forms:          ${pages.filter(p => p.features.hasForm).length}`);
  console.log(`  Pages with auth:           ${pages.filter(p => p.features.hasAuth).length}`);
  console.log(`  Pages with AI:             ${pages.filter(p => p.features.hasAI).length}`);
  console.log(`  Pages with collaboration:  ${pages.filter(p => p.features.hasCollaboration).length}`);
  console.log(`  Pages with Stripe:         ${pages.filter(p => p.features.hasStripe).length}`);
  console.log(`  Pages with Supabase:       ${pages.filter(p => p.features.hasSupabase).length}`);
  console.log(`  Pages with i18n:           ${pages.filter(p => p.features.hasI18n).length}/${pages.length}`);
  console.log(`  Server components:         ${pages.filter(p => p.features.isServerComponent).length}`);
  console.log(`  Client components:         ${pages.filter(p => p.features.isClientComponent).length}`);
  console.log('═══════════════════════════════════════════════\n');

  checkI18nCoverage(pages);
}

// ── Main ──────────────────────────────────────────────────────────────────

const pages = discoverPages(APP_DIR).map(p => ({
  ...p,
  features: analyzePage(p.fullPath),
}));

generateReport(pages);