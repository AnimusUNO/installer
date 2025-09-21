# Animus Installation Layout — Canonical Plan (Aug 2025)

This is the **single source of truth** for how an Animus install is laid out on disk and how components interact. It reflects our decisions in this thread: **one global venv for all components**, **per-module SQLite DBs**, and an **optional control plane**. SMCP stays independent.

---

## Top-Level Tree

```
/animus
├─ venv/                       # ONE shared Python venv for ALL components
├─ requirements.txt            # pinned deps for the global venv
├─ agents/                     # tenancy boundary = one folder per Prime
│  ├─ agent-<uid>/             # e.g., agent-athena, agent-monday, agent-timbre
│  │  ├─ broca2/
│  │  │  ├─ app/               # instance code or symlink to shared repo
│  │  │  ├─ config/            # module .env / settings
│  │  │  ├─ db/                # module SQLite (e.g., broca.sqlite)
│  │  │  ├─ plugins/
│  │  │  └─ logs/
│  │  ├─ thalamus/             # per-prime tool; same sub-layout as broca2
│  │  └─ <other per-prime tools>/  # same sub-layout pattern
│  └─ agent-<uid>/…
│
├─ smcp/                       # shared MCP service; completely independent
│  ├─ app/  venv/  config/  db/  plugins/  logs/  run/
│
├─ control/                    # optional; thin auth/catalog + admin UI/proxy
│  ├─ registry.db              # install-level users/sessions/agents/ports (if used)
│  ├─ gateway/                 # proxy/auth layer (FastAPI/Flask or nginx+auth)
│  ├─ web/                     # admin/demo UI (not authoritative)
│  └─ run/                     # unified process management for all modules
│     ├─ start-all.sh          # start all modules
│     ├─ stop-all.sh           # stop all modules
│     ├─ restart-all.sh        # restart all modules
│     ├─ agent-athena/
│     │  ├─ start-broca2.sh    # start specific module
│     │  ├─ stop-broca2.sh     # stop specific module
│     │  ├─ start-thalamus.sh
│     │  └─ stop-thalamus.sh
│     ├─ agent-monday/
│     │  └─ ...
│     └─ cron/                 # cron job definitions
│        ├─ animus-crontab    # main crontab file
│        └─ module-jobs/       # individual module cron jobs
└─ .env                        # install-wide knobs (paths, base ports). keep secrets minimal
```

---

## Invariants (Non-Negotiables)

* **Global venv**: `/animus/venv/` is the interpreter for **all** components (agents, modules, control plane).
* **Per-module DBs**: every module keeps its **own** SQLite under its folder (`db/<module>.sqlite`).
* **SMCP isolation**: SMCP maintains its **own** venv + SQLite + plugins under `/animus/smcp/`.
* **Config locality**: each module reads only from its own `config/` and the shared venv; no cross-module config bleed.
* **Ports**: each module binds a **unique local port**; (optional) `control/registry.db` records `{agent, module} → port`.

---

## Agent Module Config Template

Place in `agents/agent-<uid>/<module>/config/.env` (example below shows Broca/Thalamus—same shape for others):

```ini
# Shared interpreter for all components
ANIMUS_PY=/animus/venv/bin/python

# Module-specific
PORT=9xxx
DB=../db/<module>.sqlite
LOG=../logs/<module>.log

# Optional, when applicable
PLUGINS_DIR=../plugins
```

### Minimal Runner (per module)

`control/run/agent-<uid>/start-<module>.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
MODULE_ROOT="/animus/agents/agent-<uid>/<module>"
set -a; source "$MODULE_ROOT/config/.env"; set +a
exec /animus/venv/bin/python -m <module>.main
```

> Replace `<agent-uid>`, `<module>`, and `<module>.main` with actual values.
> `chmod +x control/run/agent-<uid>/start-<module>.sh` after creation.

### Process Management

The `control/run/` directory provides unified process management:

```bash
# Start all modules
/animus/control/run/start-all.sh

# Start specific agent's modules
/animus/control/run/agent-athena/start-broca2.sh

# Stop all modules
/animus/control/run/stop-all.sh

# Restart all modules
/animus/control/run/restart-all.sh
```

### Cron Integration

Most modules will eventually be cron-tabbed for automated execution:

```bash
# Install the main crontab
crontab /animus/control/run/cron/animus-crontab

# Example cron entries (in animus-crontab):
# */5 * * * * /animus/control/run/agent-athena/start-broca2.sh
# 0 */2 * * * /animus/control/run/agent-athena/start-thalamus.sh
# 0 0 * * * /animus/control/run/restart-all.sh
```

---

## Ports Convention (Deterministic)

Keep mental load low with a base + stride per module type:

* `broca2`: `9100 + <agent_index>`
* `thalamus`: `9200 + <agent_index>`
* (Add others by decade buckets: `9300+`, `9400+`, …)
* `smcp`: fixed, e.g., `8283`

You can store the chosen ports in the module's `.env` and (optionally) in `control/registry.db`.

---

## SMCP (Shared MCP Service)

* Lives entirely under `/animus/smcp/` with its **own** `venv/`, **own** `db/`, and **own** `plugins/`.
* No coupling to global venv or agent DBs.

```
/animus/smcp
├─ app/
├─ venv/
├─ config/
├─ db/            # mcp.sqlite
├─ plugins/
├─ logs/
└─ run/
```

---

## Control Plane (Optional, Thin)

If/when you want a "single front door" without changing any module DBs:

* `control/registry.db` stores:

  * `users`, `sessions`
  * `agents` (uid, name, path, ports)
  * optional `agent_memberships`
  * optional `user_agent_map` (global ↔ local user mapping cache)
* `gateway/` authenticates once and proxies `/agent/<uid>/…` to the right local port, injecting identity headers (e.g., `X-Animus-User-Email`).
* **Control interface** runs from the global venv and can directly import/access agent modules.
* Modules remain the **source of truth** for their own data (no schema changes).

---

## Global Venv Management

* **Path**: `/animus/venv/`
* **Pins file**: `/animus/requirements.txt` (auto-generated by control system)

### Module Requirements Structure

Each module maintains its own `requirements.txt` for development:

```
/animus
├─ agents/agent-athena/broca2/requirements.txt      # Module-specific deps
├─ agents/agent-athena/thalamus/requirements.txt    # Module-specific deps
├─ control/requirements.txt                          # Control plane deps
└─ smcp/requirements.txt                             # MCP service deps (independent)
```

### Control System Update Mechanism

The control system's update mechanism:

1. **Discovers** all module `requirements.txt` files
2. **Resolves** version conflicts and compatibility issues
3. **Consolidates** dependencies into `/animus/requirements.txt`
4. **Installs** everything to the global venv

Example consolidated requirements (auto-generated):

```txt
# /animus/requirements.txt
# Auto-generated by control system update mechanism
# Consolidates all module requirements into global venv

# From agents/agent-athena/broca2/requirements.txt
broca2==0.1.0
uvloop==0.20.0

# From agents/agent-athena/thalamus/requirements.txt
thalamus==0.2.0
sqlalchemy==2.0.0

# From control/requirements.txt
fastapi==0.104.0
sqlite3==3.42.0

# ... etc
```

### Manual Installation (if needed)

Initialize/update the global venv:

```bash
python3 -m venv /animus/venv
/animus/venv/bin/pip install -U pip wheel
/animus/venv/bin/pip install -r /animus/requirements.txt
```

> **Future:** If a component needs divergent deps, we can introduce **overlay venvs** per component. For now, **all components ride the global venv**.

---

## Ops & Lifecycle (Simple Rules)

* **Start/Stop**: use each module's `run/start.sh` (tiny wrappers; no global scripts required).
* **Logs**: live per module in `logs/`. Tail locally; optional control UI can expose health checks.
* **Backup/Restore Unit**: `agents/agent-<uid>/` captures everything for that Prime (configs, DBs, plugins). SMCP backed up independently.
* **Code Sharing**: `app/` can be a symlink to a shared checkout or a thin wrapper that imports installed packages from the global venv.
* **Control Interface**: runs from global venv, can directly discover and interact with agent modules.

---

## Rationale (Why This Layout)

* **Modular and simple**: every tool keeps its own SQLite DB; nothing centralized or rewritten.
* **Ops-light**: one venv to patch and one pins file to manage.
* **Control-plane-ready**: control interface can directly import agent modules without cross-venv complexity.
* **Future-proof**: overlay venvs can be introduced later if one component's dependencies diverge.
* **Clean architecture**: control interface becomes just another Python module in the same ecosystem.

---

## Quick Checklist (when adding a new Prime)

1. `mkdir -p /animus/agents/agent-<uid>/{broca2,thalamus}/{app,config,db,logs,plugins}`
2. Put module `.env` files using `ANIMUS_PY=/animus/venv/bin/python` and pick ports.
3. Ensure global venv exists and deps installed from `requirements.txt`.
4. Create run scripts in `control/run/agent-<uid>/` for each module.
5. (Optional) Add the agent + ports to `control/registry.db`.
6. (Optional) Add cron entries to `/animus/control/run/cron/animus-crontab`.

---

That's the whole picture. If you want this split into smaller doclets (e.g., "For Devs", "For Ops", "For UI/Control"), say the word and I'll fracture it cleanly.
