#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { transform } from 'esbuild';

const projectRoot = process.cwd();
const inputHtmlPath = path.resolve(projectRoot, 'index.html');
const outputDirPath = path.resolve(projectRoot, 'dist');
const outputHtmlPath = path.resolve(outputDirPath, 'mindsweeper-play.html');

const SCRIPT_TAG_PATTERN = /<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
const STYLESHEET_TAG_PATTERN = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/i;
const EXTERNAL_SRC_PATTERN = /^(https?:)?\/\//i;

function escapeClosingScriptTag(source) {
  return source.replace(/<\/script>/gi, '<\\/script>');
}

async function minifyCss(cssPath) {
  const cssSource = await readFile(cssPath, 'utf8');
  const result = await transform(cssSource, {
    loader: 'css',
    minify: true,
    legalComments: 'none',
  });

  return result.code.trim();
}

async function minifyJs(jsPath) {
  const jsSource = await readFile(jsPath, 'utf8');
  const result = await transform(jsSource, {
    loader: 'js',
    minify: true,
    legalComments: 'none',
    charset: 'utf8',
    target: 'es2020',
  });

  return result.code.trim();
}

async function buildSingleHtml() {
  const htmlSource = await readFile(inputHtmlPath, 'utf8');

  const stylesheetMatch = htmlSource.match(STYLESHEET_TAG_PATTERN);
  if (!stylesheetMatch) {
    throw new Error('Could not find a stylesheet <link rel="stylesheet" ...> tag in index.html');
  }

  const stylesheetHref = stylesheetMatch[1];
  const stylesheetPath = path.resolve(projectRoot, stylesheetHref);
  const minifiedCss = await minifyCss(stylesheetPath);

  let outputHtml = htmlSource.replace(stylesheetMatch[0], `<style>${minifiedCss}</style>`);

  const scriptMatches = [...outputHtml.matchAll(SCRIPT_TAG_PATTERN)];
  let rebuiltHtml = '';
  let lastIndex = 0;
  let inlinedScriptCount = 0;
  let externalScriptCount = 0;
  for (const match of scriptMatches) {
    const fullTag = match[0];
    const matchIndex = match.index ?? -1;
    if (matchIndex < 0) continue;
    rebuiltHtml += outputHtml.slice(lastIndex, matchIndex);
    lastIndex = matchIndex + fullTag.length;
    const scriptSrc = match[1];
    if (EXTERNAL_SRC_PATTERN.test(scriptSrc)) {
      externalScriptCount += 1;
      rebuiltHtml += fullTag;
      continue;
    }
    const scriptPath = path.resolve(projectRoot, scriptSrc);
    const minifiedJs = await minifyJs(scriptPath);
    rebuiltHtml += `<script>${escapeClosingScriptTag(minifiedJs)}</script>`;
    inlinedScriptCount += 1;
  }
  rebuiltHtml += outputHtml.slice(lastIndex);
  outputHtml = rebuiltHtml;

  await mkdir(outputDirPath, { recursive: true });
  await writeFile(outputHtmlPath, outputHtml, 'utf8');

  console.log(
    `Built ${path.relative(projectRoot, outputHtmlPath)} (inlined ${inlinedScriptCount} local scripts, kept ${externalScriptCount} remote external scripts, and inlined 1 stylesheet).`
  );
}

buildSingleHtml().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
