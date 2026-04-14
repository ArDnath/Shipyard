#!/bin/sh
set -e

# ─── Validate required environment variables ──────────────────────────────
# The colon-dash syntax fails loudly with a clear message if any var is unset
# or empty — the build dies here rather than with a cryptic error later.

: "${REPO_URL:?REPO_URL is required}"
: "${BRANCH:?BRANCH is required}"
: "${INSTALL_COMMAND:?INSTALL_COMMAND is required}"
: "${BUILD_COMMAND:?BUILD_COMMAND is required}"
: "${OUTPUT_DIR:?OUTPUT_DIR is required}"

# ─── Clone ────────────────────────────────────────────────────────────────
# --depth=1          → shallow clone, only latest commit (no history)
# --single-branch    → only fetch the target branch, not all refs
# --                 → end of options, prevents branch name being a flag

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📦 CLONE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  repo   : ${REPO_URL}"
echo "  branch : ${BRANCH}"
echo ""

git clone \
  --depth=1 \
  --single-branch \
  --branch "${BRANCH}" \
  -- \
  "${REPO_URL}" \
  /workspace/repo

echo ""
echo "✔ Clone complete"

# ─── Install ──────────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📥 INSTALL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  command : ${INSTALL_COMMAND}"
echo ""

cd /workspace/repo
eval "${INSTALL_COMMAND}"

echo ""
echo "✔ Install complete"

# ─── Build ────────────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🏗  BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  command : ${BUILD_COMMAND}"
echo ""

eval "${BUILD_COMMAND}"

echo ""
echo "✔ Build complete"

# ─── Verify output ────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔍 VERIFY OUTPUT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

OUTPUT_PATH="/workspace/repo/${OUTPUT_DIR}"

if [ ! -d "${OUTPUT_PATH}" ]; then
  echo ""
  echo "✖ Output directory not found: ${OUTPUT_PATH}"
  echo "  The build command ran successfully but did not produce a"
  echo "  directory at the expected path."
  echo "  → Check that buildCommand writes to '${OUTPUT_DIR}'"
  echo ""
  exit 1
fi

# Count files in the output directory so the caller knows something is there
FILE_COUNT=$(find "${OUTPUT_PATH}" -type f | wc -l | tr -d ' ')

echo ""
echo "✔ Output verified"
echo "  path  : ${OUTPUT_PATH}"
echo "  files : ${FILE_COUNT}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ BUILD SUCCEEDED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
