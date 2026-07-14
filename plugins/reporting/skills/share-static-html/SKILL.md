---
name: share-static-html
description: Serve static HTML artifacts over Tailscale.
---

# Share Static HTML

## Workflow

When you create or update an HTML artifact for the user, serve it automatically and include the Tailscale URL in the final response.

Use the bundled script:

```bash
python3 scripts/serve_static_html.py /absolute/path/to/report.html
```

The script:

- Finds the Tailscale IPv4 address with `tailscale ip -4`.
- Maintains one shared `python3 -m http.server` process for all shared HTML artifacts.
- Adds each artifact under `/tmp/share-static-html/root/<slug>/...` using symlinks.
- Binds only to `127.0.0.1` and the Tailscale IP.
- Does not bind to `0.0.0.0` or a public interface.
- Reuses the existing server when it is alive; starts one from port `8765` when needed.
- Cleans stale share links so one-off reports do not pile up forever.
- Prints both localhost and Tailscale URLs; use the Tailscale URL in final responses unless the user asks otherwise.

If the user asks for the report link, give the Tailscale URL, not a local filesystem link.

## Notes

- Use the script instead of starting ad hoc `http.server` processes.
- The shared document root uses links to containing directories so relative CSS/JS/assets work.
- If the artifact is private-sensitive, mention that the Tailscale URL is reachable by devices on the same Tailscale network.
- Do not copy HTML into tracked repo paths just to share it; serve the existing artifact in place.
