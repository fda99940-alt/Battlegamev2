#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { transform } from 'esbuild';

const projectRoot = process.cwd();
const inputHtmlPath = path.resolve(projectRoot, 'index.html');
const outputDirPath = path.resolve(projectRoot, 'dist');
const outputHtmlPath = path.resolve(outputDirPath, 'index.single.html');

const SCRIPT_TAG_PATTERN = /<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
const STYLESHEET_TAG_PATTERN = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/i;

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
  for (const match of scriptMatches) {
    const fullTag = match[0];
    const scriptSrc = match[1];
    const scriptPath = path.resolve(projectRoot, scriptSrc);
    const minifiedJs = await minifyJs(scriptPath);
    outputHtml = outputHtml.replace(fullTag, `<script>${escapeClosingScriptTag(minifiedJs)}</script>`);
  }

  await mkdir(outputDirPath, { recursive: true });
  await writeFile(outputHtmlPath, outputHtml, 'utf8');

  const scriptCount = scriptMatches.length;
  console.log(`Built ${path.relative(projectRoot, outputHtmlPath)} (inlined ${scriptCount} scripts and 1 stylesheet).`);
}

buildSingleHtml().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
