import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const configPath = path.join(rootDir, "file-size-baseline.json");

if (!fs.existsSync(configPath)) {
  console.error("Missing file-size-baseline.json.");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const maxLines = Number(config.maxLines ?? 300);
const warnLines = Number(config.warnLines ?? 250);
const exceptions = config.exceptions ?? {};
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const ignoredDirectories = new Set([".git", ".next", "node_modules"]);

const sourceFiles = [];
walk(path.join(rootDir, "src"), sourceFiles);

const failures = [];
const warnings = [];

for (const absolutePath of sourceFiles) {
  const relativePath = normalizePath(path.relative(rootDir, absolutePath));
  const content = fs.readFileSync(absolutePath, "utf8");
  const lineCount = content.split("\n").length;
  const exceptionLimit = exceptions[relativePath];
  const effectiveLimit = typeof exceptionLimit === "number" ? exceptionLimit : maxLines;

  if (lineCount > effectiveLimit) {
    failures.push({
      kind: exceptionLimit ? "exception-growth" : "new-oversize",
      lineCount,
      limit: effectiveLimit,
      relativePath,
    });
    continue;
  }

  if (!exceptionLimit && lineCount >= warnLines) {
    warnings.push({ lineCount, relativePath });
  }
}

if (warnings.length > 0) {
  console.log("File-size warnings (approaching limit):");
  for (const warning of warnings.sort((a, b) => b.lineCount - a.lineCount)) {
    console.log(`  ${warning.lineCount.toString().padStart(4)} ${warning.relativePath}`);
  }
}

if (failures.length > 0) {
  console.error("\nFile-size check failed:");
  for (const failure of failures.sort((a, b) => b.lineCount - a.lineCount)) {
    const reason = failure.kind === "exception-growth"
      ? "exceeded baseline exception cap"
      : "exceeded global maxLines cap";
    console.error(
      `  ${failure.lineCount.toString().padStart(4)} ${failure.relativePath} (limit ${failure.limit}) ${reason}`,
    );
  }

  process.exit(1);
}

console.log("File-size check passed.");

function walk(currentDir, files) {
  if (!fs.existsSync(currentDir)) return;

  for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;

    const absolutePath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      walk(absolutePath, files);
      continue;
    }

    if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }
}

function normalizePath(relativePath) {
  return relativePath.split(path.sep).join("/");
}
