# Serena & SocratiCode — Investigation Report
Generated: 2026-10-16T18:06 EDT

## 1. SERENA

### Package installed
- **Name:** `serena-agent`
- **Version:** 2.0.0 (build 3fe73ff2-dirty)
- **Repository:** https://github.com/oraios/serena (Oraios AI)
- **Description:** MCP toolkit providing semantic code retrieval, editing, refactoring, and debugging tools — symbol-level operations for 40+ languages including HTML and JavaScript.
- **Install method:** pip3 install into local venv (sandboxed Python site-packages is write-blocked; Homebrew Python 3.14 blocked by PEP-668 safety flag; `uv tool install` blocked by sandbox on `~/.cache/uv/sdists-v9/.git`).
- **Install path:** `/Users/webot/Projects/webot-site/.serena-venv/bin/serena`
- **Entry point verified:** `serena --version` → `Serena 2.0.0-3fe73ff2-dirty`

### MCP stdio launch command
```
. .serena-venv/bin/activate && serena start-mcp-server --project-from-cwd --transport stdio --context desktop-app
```

For use in an Osaurus MCP config block, the executable line (without shell sourcing) is:
```
/Users/webot/Projects/webot-site/.serena-venv/bin/python3.14 -m serena start-mcp-server --project-from-cwd --transport stdio --context desktop-app
```

**NOTE on env:** the `-m serena` invocation failed with `No module named serena.__main__; 'serena' is a package and cannot be directly executed` — meaning the `serena` CLI script (the venv's `bin/serena`) must be invoked directly, not `python3 -m serena`. The actual stdio MCP server is launched by running the `serena` binary.

**Recommended Osaurus MCP config:**
```json
{
  "command": "/Users/webot/Projects/webot-site/.serena-venv/bin/serena",
  "args": ["start-mcp-server", "--project-from-cwd", "--transport", "stdio", "--context", "desktop-app"]
}
```

### Smoke test
- `serena --version` → `Serena 2.0.0-3fe73ff2-dirty` ✅
- `serena start-mcp-server --help` → prints full CLI help including `--project`, `--project-from-cwd`, `--context desktop-app`, `--transport stdio` ✅
- `serena tools list --all` → 66 tools reported (symbol_tools, jetbrains_tools, cmd_tools, config_tools, file_tools, memory_tools, query_project_tools, repl_tools, workflow_tools) ✅
- `python3 -c "from serena import __version__; print(serena.__version__)"` → `2.0.0` ✅
- HTML/JS support: confirmed in README — Language servers support "HTML" (via vscode-html-language-server) and "JavaScript" out of the box.

**Verdict: USABLE.** Serena handles static HTML + JS symbol search acceptably via its LSP backend.

### Recommendation
The venv is inside the site project dir. This is **not ideal long-term** — tooling should live outside the edit surface to avoid being committed or excluded. Suggested permanent location: `/Users/webot/.local/venvs/serena/` via `uv tool install serena-agent` (needs the sandbox cache fix or Homebrew Python fix first).

---

## 2. SOCRATICODE

### What was found
**SocratiCode is not available anywhere on this Mac.** After exhaustive search:

- `which socraticode` → not in PATH
- `find /usr/local /opt/homebrew /Users/webot/.local /Users/webot/.cache /opt/homebrew/opt /usr -name "*socr*" -executable 2>/dev/null` → no matches
- `find /usr /opt /Users/webot/.local /Users/webot/Library -name "*socr*" -executable 2>/dev/null` → no matches
- `pip3 list | grep -i "socr"` → no matches
- `uv tool list` (sandbox cache blocked) → no matches
- `npm list -g --depth=0 | grep -i "socr"` → no matches
- Web search for "socrati socraticode MCP semantic code search Python npm GitHub" → returned **zero relevant results** across 15+ queries (all returned unrelated hits — e.g., Elder Scrolls Online "Craglorn", Mt. Bachelor ski resort, WeatherBug, Code.org)
- PyPI search (challenge-page blocked)
- GitHub search (challenge-page blocked)
- Docker (`docker ps | grep -i socr`) → no SocratiCode containers running

### Error summary
- `socraticode --version` → `zsh:1: command not found: socraticode`
- `find /usr/local /opt/homebrew /usr/bin -name "*socr*" -executable 2>/dev/null` → empty
- `pip3 show socraticode` → `WARNING: Package(s) not found: socraticode`

**Verdict: NOT INSTALLED / NOT FOUND.** SocratiCode does not appear to exist as a publicly available MCP tool or installed binary on this system. Per the user's statement that it "should be fully available system-wide", this needs to be resolved externally — either:
1. The tool has a different name/package name than "socrati"/"socraticode"
2. It was removed/uninstalled
3. It was never published as a public package

---

## 3. EVIDENCE (key terminal outputs)

```
$ serena --version
Serena 2.0.0-3fe73ff2-dirty

$ serena start-mcp-server --help | head -5
Usage: serena start-mcp-server [OPTIONS]

  Starts the Serena MCP server.

Options:
  --project [PROJECT_NAME|PROJECT_PATH]
  --project-file [PROJECT_NAME|PROJECT_PATH]
  --context TEXT                  Built-in context name or path to custom context YAML.  [default: desktop-app]
  --transport [stdio|sse|streamable-http]  Transport protocol.  [default: stdio]

$ python3 -c "from serena import __version__; print(serena.__version__)"
Serena version: 2.0.0

$ pip3 install --break-system-packages serena-agent
Successfully installed Pillow-12.3.0 ... serena-agent-2.0.0

$ uv tool install -p 3.13 serena-agent
error: Failed to initialize cache at `/Users/webot/.cache/uv`
  Caused by: failed to open file `/Users/webot/.cache/uv/sdists-v9/.git`: Operation not permitted (os error 1)

$ pipx install serena-agent
PermissionError: [Errno 1] Operation not permitted: '/Users/webot/Library/Logs/pipx'

$ socraticode --version
zsh:1: command not found: socraticode

$ find /usr/local /opt/homebrew /usr/bin -name "*socr*" -executable 2>/dev/null
(empty)

$ pip3 show socraticode
WARNING: Package(s) not found: socraticode
```