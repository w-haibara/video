FROM node:24

ARG TZ
ENV TZ="$TZ"
ARG CLAUDE_CODE_VERSION=latest

# System packages
RUN apt-get update && apt-get install -y --no-install-recommends \
  less git procps sudo fzf zsh man-db unzip gnupg2 gh \
  iptables ipset iproute2 dnsutils aggregate jq nano vim \
  ffmpeg xauth \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create alice user explicitly (remove any existing uid/gid 1000 first)
RUN userdel -r "$(getent passwd 1000 | cut -d: -f1)" 2>/dev/null || true && \
  groupdel "$(getent group 1000 | cut -d: -f1)" 2>/dev/null || true && \
  groupadd --gid 1000 alice && \
  useradd --uid 1000 --gid 1000 -m -s /bin/zsh alice

# npm global directory
RUN mkdir -p /usr/local/share/npm-global && \
  chown -R alice:alice /usr/local/share

ARG USERNAME=alice

# Bash history persistence
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  && mkdir /commandhistory \
  && touch /commandhistory/.bash_history \
  && chown -R $USERNAME /commandhistory

ENV DEVCONTAINER=true

RUN mkdir -p /workspace /home/alice/.claude && \
  chown -R alice:alice /workspace /home/alice/.claude

WORKDIR /workspace

# git-delta
ARG GIT_DELTA_VERSION=0.18.2
RUN ARCH=$(dpkg --print-architecture) && \
  wget "https://github.com/dandavison/delta/releases/download/${GIT_DELTA_VERSION}/git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  dpkg -i "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  rm "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"

# Playwright Chromium + system deps (shared path so node user can access)
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/local/share/playwright-browsers
RUN npx playwright install --with-deps chromium && \
  chmod -R o+rx "$PLAYWRIGHT_BROWSERS_PATH" && \
  mkdir -p /opt/google/chrome && \
  ln -sf "$PLAYWRIGHT_BROWSERS_PATH"/chromium-*/chrome-linux64/chrome /opt/google/chrome/chrome

USER alice

ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
ENV PATH=$PATH:/usr/local/share/npm-global/bin
ENV SHELL=/bin/zsh
ENV EDITOR=nano
ENV VISUAL=nano

# Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL="/home/alice/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

# zsh
ARG ZSH_IN_DOCKER_VERSION=1.2.1
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v${ZSH_IN_DOCKER_VERSION}/zsh-in-docker.sh)" -- \
  -p git -p fzf \
  -a "source /usr/share/doc/fzf/examples/key-bindings.zsh" \
  -a "source /usr/share/doc/fzf/examples/completion.zsh" \
  -a "export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  -x

# Claude Code + playwright-cli
RUN npm install -g @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION} @playwright/cli

# Firewall script + sudoers
COPY init-firewall.sh setup-claude.sh /usr/local/bin/
USER root
RUN chmod +x /usr/local/bin/init-firewall.sh /usr/local/bin/setup-claude.sh && \
  echo "alice ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" > /etc/sudoers.d/alice-firewall && \
  echo "alice ALL=(root) NOPASSWD: /usr/bin/git config --system *" >> /etc/sudoers.d/alice-firewall && \
  chmod 0440 /etc/sudoers.d/alice-firewall
USER alice
