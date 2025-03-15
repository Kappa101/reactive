#!/bin/bash

# Detect staged JavaScript, TypeScript, Python, and Java files
FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|jsx|java|py)$')

# Regex for detecting commented-out functions, classes, or React components
COMMENTED_CODE_REGEX='^\s*(//|#|/\*)\s*(function|const|class|def|public|private|static|return|import|export|React)'

BLOCKED_FILES=()

for FILE in $FILES; do
    if grep -E "$COMMENTED_CODE_REGEX" "$FILE"; then
        BLOCKED_FILES+=("$FILE")
    fi
done

# If any files contain commented-out code, reject commit
if [ ${#BLOCKED_FILES[@]} -gt 0 ]; then
    echo "❌ Commit rejected: Commented-out code detected in the following files:"
    printf '%s\n' "${BLOCKED_FILES[@]}"
    echo "➡️  Remove the commented-out functions/classes and commit again."
    exit 1
fi

exit 0
