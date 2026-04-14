FROM node:20-alpine

# Install git and curl (curl needed to install bun)
RUN apk add --no-cache git curl bash

# Install bun — so projects using "bun install" or "bun run build" also work
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Verify both package managers are available
RUN node --version && npm --version && bun --version

# Create the workspace mount point
# host:  /tmp/shipyard/<uuid>
# container: /workspace  (same files via volume mount)
RUN mkdir -p /workspace

# Copy and permission the entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# NOTE: we intentionally do NOT set USER here.
# The /workspace directory is owned by root on the host (created by fs.mkdirSync).
# A non-root user inside the container cannot write to it via the volume mount.
# Container-level isolation (--cap-drop=ALL, --security-opt=no-new-privileges,
# --pids-limit, --memory cap) already provides the security boundary.

WORKDIR /workspace

ENTRYPOINT ["/entrypoint.sh"]
