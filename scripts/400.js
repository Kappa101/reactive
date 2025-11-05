#!/usr/bin/env node

/**
 * Governance Script: Check React Component File Line Limits
 *
 * This script validates that React component files do not exceed
 * the maximum allowed lines (default: 400).
 *
 * Rules:
 * - Non-React files (*.test.*, *.json, config files, assets, etc.) → Always allow
 * - Existing React files that were ≤ 400 lines and become > 400 → Block
 * - New React files that exceed 400 lines → Block
 *
 * Usage:
 *   node governance/check-file-lines.js [--max-lines=400] [--path=src] [--staged]
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const DEFAULT_MAX_LINES = 20;
const DEFAULT_PATHS = ["src", "components", "app"];

// Parse command line arguments
const args = process.argv.slice(2);
const maxLinesArg = args.find((arg) => arg.startsWith("--max-lines="));
const pathArg = args.find((arg) => arg.startsWith("--path="));
const useStaged = args.includes("--staged");

const MAX_LINES = maxLinesArg
  ? parseInt(maxLinesArg.split("=")[1])
  : DEFAULT_MAX_LINES;
const SEARCH_PATHS = pathArg ? [pathArg.split("=")[1]] : DEFAULT_PATHS;

// Start timing (using hrtime for compatibility with older Node.js versions)
const startTime = process.hrtime();

// Setup logging to file
const logDir = path.join(process.cwd(), ".governance-logs");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const logFileName = `governance-check-${timestamp}.log`;
const logFilePath = path.join(logDir, logFileName);

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
} else {
  // Delete older log files before creating new one
  try {
    const files = fs.readdirSync(logDir);
    files.forEach((file) => {
      if (file.startsWith("governance-check-") && file.endsWith(".log")) {
        const filePath = path.join(logDir, file);
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          // Silently continue if deletion fails
        }
      }
    });
  } catch (error) {
    // Silently continue if cleanup fails
  }
}

/**
 * Log to file (using synchronous write for reliability)
 */
function logToFile(message) {
  try {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFilePath, logLine, "utf8");
  } catch (error) {
    // If logging fails, silently continue (don't break the script)
  }
}

/**
 * Override console.log and console.error to log to file
 * Terminal output is minimal - just points to log file
 */
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = function (...args) {
  const message = args
    .map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
    )
    .join(" ");
  logToFile(message);
  // Don't output to terminal - only log to file
};

console.error = function (...args) {
  const message = args
    .map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
    )
    .join(" ");
  logToFile(message);
  // Don't output to terminal - only log to file
};

// Show log file location to user (only this goes to terminal)
originalConsoleLog(`📝 All output is being logged to: ${logFilePath}`);
logToFile(`Governance check started at ${new Date().toISOString()}`);
logToFile(`Command: ${process.argv.join(" ")}`);

// Non-React file patterns (always allowed)
const NON_REACT_PATTERNS = [
  /\.test\.(js|ts|jsx|tsx)$/i,
  /\.spec\.(js|ts|jsx|tsx)$/i,
  /\.json$/i,
  /\.config\.(js|ts)$/i,
  /config\.(js|ts|json)$/i,
  /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|css|scss|sass|less)$/i,
  /\.md$/i,
  /\.txt$/i,
];

/**
 * Check if file content contains React code
 */
function containsReactCode(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    // Check for React imports or JSX patterns
    return (
      /import\s+.*\s+from\s+['"]react['"]/i.test(content) ||
      /from\s+['"]react['"]/i.test(content) ||
      /require\s*\(\s*['"]react['"]\s*\)/i.test(content) ||
      /<[A-Z][a-zA-Z0-9]*/i.test(content) || // JSX tags
      /React\.(createElement|Component)/i.test(content)
    );
  } catch (error) {
    return false;
  }
}

/**
 * Check if file is a React component file
 * Returns false for non-React files (tests, configs, assets, etc.)
 */
function isReactComponent(filePath) {
  // First, check if it's a non-React file (always allow these)
  const fileName = path.basename(filePath);
  if (NON_REACT_PATTERNS.some((pattern) => pattern.test(fileName))) {
    return false;
  }

  // Check file extension patterns
  const hasReactExtension = /\.(jsx|tsx)$/i.test(fileName);
  const isPascalCaseComponent = /^[A-Z][a-zA-Z]*\.(js|ts)$/i.test(fileName);

  if (hasReactExtension) {
    return true; // .jsx and .tsx are always React components
  }

  if (isPascalCaseComponent) {
    // For .js/.ts files with PascalCase, check if they contain React code
    return containsReactCode(filePath);
  }

  // For other .js/.ts files, check if they contain React code
  if (/\.(js|ts)$/i.test(fileName)) {
    return containsReactCode(filePath);
  }

  return false;
}

/**
 * Check if file exists in git (is not new)
 */
function fileExistsInGit(filePath) {
  try {
    execSync(`git ls-files --error-unmatch "${filePath}"`, {
      encoding: "utf-8",
      stdio: "ignore",
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get original line count from git for a modified file
 * Returns the line count from HEAD (last committed version)
 */
function getOriginalLineCount(filePath) {
  try {
    // Try to get the file from HEAD (last committed version)
    let originalContent = "";
    try {
      originalContent = execSync(`git show HEAD:"${filePath}"`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
    } catch (headError) {
      // If file doesn't exist in HEAD, try to get from index
      try {
        originalContent = execSync(`git show :"${filePath}"`, {
          encoding: "utf-8",
          stdio: "pipe",
        });
      } catch (indexError) {
        // File doesn't exist in git - it's new
        return null;
      }
    }

    if (originalContent && originalContent.trim()) {
      return originalContent.split("\n").length;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if current directory is a git repository
 */
function isGitRepository() {
  try {
    execSync("git rev-parse --git-dir", {
      encoding: "utf-8",
      stdio: "ignore",
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get list of files to check with their status (new/modified)
 */
function getFilesToCheck() {
  const files = [];

  if (useStaged) {
    // Check if we're in a git repository
    if (!isGitRepository()) {
      const errorMsg =
        "\n❌ Error: Not a git repository.\n   The --staged option requires a git repository.\n   Please run this command from a git repository or use without --staged flag.\n";
      console.error(errorMsg);
      originalConsoleError(`\n📝 Error details logged to: ${logFilePath}\n`);
      process.exit(1);
    }

    // Get staged files from git (compatible with older Git versions)
    try {
      // Try modern syntax first, then fall back to older syntax
      let stagedFiles = [];
      try {
        // Git 2.9+ syntax - use separate commands to avoid parsing issues
        const diffOutput = execSync(
          "git diff --cached --name-only --diff-filter=ACM",
          {
            encoding: "utf-8",
            stdio: "pipe",
          }
        );
        stagedFiles = diffOutput.trim().split("\n").filter(Boolean);
      } catch (modernError) {
        // Fall back to git diff-index for older Git versions
        try {
          const indexOutput = execSync(
            "git diff-index --cached --name-only HEAD",
            {
              encoding: "utf-8",
              stdio: "pipe",
            }
          );
          stagedFiles = indexOutput.trim().split("\n").filter(Boolean);
        } catch (indexError) {
          // Last resort: use git diff-index without --cached
          // This lists files that differ from HEAD (includes staged)
          try {
            const allChangedOutput = execSync(
              "git diff-index --name-only HEAD",
              {
                encoding: "utf-8",
                stdio: "pipe",
              }
            );
            stagedFiles = allChangedOutput.trim().split("\n").filter(Boolean);
          } catch (fallbackError) {
            const errorMsg =
              "\n❌ Error: Unable to get staged files.\n   This may indicate an old Git version.\n   Please try: git diff --cached --name-only manually to verify.\n";
            console.error(errorMsg);
            originalConsoleError(
              `\n📝 Error details logged to: ${logFilePath}\n`
            );
            throw new Error(
              "Unable to get staged files. Error: " + fallbackError.message
            );
          }
        }
      }

      stagedFiles.forEach((file) => {
        // Only check if file exists and is a React component
        // Non-React files are automatically allowed (skip them)
        if (fs.existsSync(file) && isReactComponent(file)) {
          const isNew = !fileExistsInGit(file);
          const originalLineCount = isNew ? null : getOriginalLineCount(file);

          files.push({
            path: file,
            isNew: isNew,
            originalLineCount: originalLineCount,
          });
        }
      });
    } catch (error) {
      console.error("Error getting staged files:", error.message);
      originalConsoleError(`\n📝 Error details logged to: ${logFilePath}\n`);
      process.exit(1);
    }
  } else {
    // Check all files in search paths
    SEARCH_PATHS.forEach((searchPath) => {
      if (!fs.existsSync(searchPath)) {
        return;
      }

      function walkDir(dir) {
        const filesInDir = fs.readdirSync(dir);

        filesInDir.forEach((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            // Skip node_modules and other common ignore directories
            if (
              !["node_modules", ".git", "dist", "build", ".next"].includes(file)
            ) {
              walkDir(filePath);
            }
          } else if (isReactComponent(filePath)) {
            const isNew = !fileExistsInGit(filePath);
            const originalLineCount = isNew
              ? null
              : getOriginalLineCount(filePath);

            files.push({
              path: filePath,
              isNew: isNew,
              originalLineCount: originalLineCount,
            });
          }
        });
      }

      walkDir(searchPath);
    });
  }

  return files;
}

/**
 * Count lines in a file
 * When useStaged is true, reads from git index (staged version) for accuracy
 */
function countLines(filePath, useStaged = false) {
  try {
    let content;
    if (useStaged) {
      // Try to get staged version from git index
      try {
        content = execSync(`git show :"${filePath}"`, {
          encoding: "utf-8",
          stdio: "pipe",
        });
      } catch (error) {
        // Fallback to filesystem if git show fails (e.g., file not staged yet)
        content = fs.readFileSync(filePath, "utf-8");
      }
    } else {
      content = fs.readFileSync(filePath, "utf-8");
    }
    return content.split("\n").length;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Get refactoring suggestions
 */
function getRefactoringSuggestions() {
  return `
💡 Refactoring Suggestions:
   • Extract reusable UI components (buttons, inputs, cards, etc.)
   • Move complex logic into custom hooks (use*.js)
   • Separate data fetching logic into service/API modules
   • Break large components into smaller, focused components
   • Extract constants and utility functions to separate files
   • Consider using compound components pattern
   • Split component logic: container/presentational pattern
   • Move complex state management to context or state libraries
`;
}

/**
 * Format elapsed time in a human-readable format
 */
function formatElapsedTime(startTime) {
  const endTime = process.hrtime(startTime);
  // hrtime returns [seconds, nanoseconds]
  const elapsedMs = endTime[0] * 1000 + endTime[1] / 1000000; // Convert to milliseconds

  if (elapsedMs < 1000) {
    return `${elapsedMs.toFixed(2)}ms`;
  } else {
    const elapsedSec = elapsedMs / 1000;
    return `${elapsedSec.toFixed(2)}s`;
  }
}

/**
 * Main validation function
 */
function validateFiles() {
  const files = getFilesToCheck();
  const violations = [];

  files.forEach((fileInfo) => {
    const { path: filePath, isNew, originalLineCount } = fileInfo;
    const currentLineCount = countLines(filePath, useStaged);

    // Rule 1: New React component files - block if > 400 lines
    if (isNew) {
      if (currentLineCount > MAX_LINES) {
        violations.push({
          file: filePath,
          lines: currentLineCount,
          maxLines: MAX_LINES,
          excess: currentLineCount - MAX_LINES,
          type: "new",
        });
      }
    }
    // Rule 2: Modified React component files - block if originally ≤ 400 and now > 400
    else {
      // If we can't get original line count, treat it as a new file check
      if (originalLineCount === null) {
        // File exists in git but we can't read original - check current count
        if (currentLineCount > MAX_LINES) {
          violations.push({
            file: filePath,
            lines: currentLineCount,
            maxLines: MAX_LINES,
            excess: currentLineCount - MAX_LINES,
            type: "modified",
            originalLines: "unknown",
          });
        }
      } else {
        // File was originally ≤ 400 lines and now exceeds 400
        if (originalLineCount <= MAX_LINES && currentLineCount > MAX_LINES) {
          violations.push({
            file: filePath,
            lines: currentLineCount,
            maxLines: MAX_LINES,
            excess: currentLineCount - MAX_LINES,
            type: "modified",
            originalLines: originalLineCount,
          });
        }
      }
    }
  });

  if (violations.length > 0) {
    console.error("\n❌ Governance Rule Violation: File Line Limit Exceeded\n");

    violations.forEach((violation) => {
      if (violation.type === "new") {
        console.error(
          `❌ New component exceeds 400 lines. Break it into smaller components following SRP and re-commit.`
        );
        console.error(`   File: ${violation.file}`);
        console.error(
          `   Lines: ${violation.lines} (exceeds limit by ${violation.excess} lines)`
        );
        console.error("");
      } else {
        console.error(
          `❌ Component exceeded 400 lines after modification. Please refactor and resubmit.`
        );
        console.error(`   File: ${violation.file}`);
        if (violation.originalLines !== "unknown") {
          console.error(
            `   Original lines: ${violation.originalLines} (was within limit)`
          );
        }
        console.error(
          `   Current lines: ${violation.lines} (exceeds limit by ${violation.excess} lines)`
        );
        console.error("");
      }
    });

    console.error(getRefactoringSuggestions());
    const elapsedTime = formatElapsedTime(startTime);
    console.error(`\n⏱️  Execution time: ${elapsedTime}\n`);
    logToFile(
      `Execution completed with violations at ${new Date().toISOString()}`
    );
    originalConsoleError(
      `\n❌ Governance check failed. See full details in: ${logFilePath}\n`
    );
    process.exit(1);
  } else {
    console.log(
      `✅ All React component files comply with the ${MAX_LINES} line limit.`
    );
    const elapsedTime = formatElapsedTime(startTime);
    console.log(`⏱️  Execution time: ${elapsedTime}`);
    logToFile(
      `Execution completed successfully at ${new Date().toISOString()}`
    );
    originalConsoleLog(
      `\n✅ Governance check passed. Log saved to: ${logFilePath}\n`
    );
    process.exit(0);
  }
}

// Run validation
validateFiles();
