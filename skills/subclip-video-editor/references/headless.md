# Subclip with or without a screen (GUI or headless)

Subclip runs either as the normal desktop app (GUI) or headless: no window and no tray, only the local MCP server and background work. Headless starts with `--headless`, `SUBCLIP_HEADLESS=1`, or automatically on Linux with no display server. The MCP tools are the same; what differs is everything that needs a person in front of the screen.

## Which one am I connected to?

Call `get_sign_in_status` (works signed out). `device.headless` is `true` for a headless instance. Check it once at the start of a session and plan around it.

## Differences

| | GUI | Headless |
|---|---|---|
| `sign_in` | Opens the approval page in this computer's browser (`openedBrowser: true`) | Opens nothing (`openedBrowser: false`) |
| `request_approval`, approval prompts | Window on the creator's screen | Fail at once with "Subclip is running headless": ask the human in chat instead and only continue on a clear yes |
| Native dialogs (open/save/confirm) | Shown | Answered as Cancel and logged; pass explicit paths instead |
| Desktop control (`open_app`, `mouse_*`, `type_text`, `press_key`, `take_screenshot`, `capture_window`, `pick_*_area`) | Available with permissions | Unavailable: there is no screen to act on |
| Recorder (`start_recording`, `open_recorder`) | Available | Unavailable; editing already saved recordings still works |
| `open_upgrade_page` | Opens the browser | Returns the link only |
| `install_app_update_and_restart` on Linux .deb/.rpm | May show a password prompt | Refused with `refused: "needs-admin"` and `manualInstallCommand` unless Subclip runs as root or has passwordless sudo |

In both modes show the human BOTH the `sign_in` link (`verificationUriComplete`) and the `userCode`, ask them to open it wherever they are signed in to subclip.app, check the code and press Approve, then poll `get_sign_in_status` every `interval` seconds. Never approve it yourself. Headless, this is the only way to sign in.

For a `needs-admin` refusal, give the human the exact `manualInstallCommand` to run in a terminal on that machine, then restart Subclip (`--restart`, below). Do not retry the tool.

Projects, editing, transcription, AI generation, exports and publishing work the same in both modes; exports save to the folder you pass (or the last export folder).

## Connecting from the command line

These commands talk to the app installed on the machine. They never open a window and exit when done. `<subclip>` is the app executable: `"/Applications/AI Video Editor by Subclip.app/Contents/MacOS/AI Video Editor by Subclip"` on macOS, `ai-video-editor-by-subclip` on Linux (.deb/.rpm; the AppImage file itself otherwise), `"$env:LOCALAPPDATA\Programs\AI Video Editor by Subclip\AI Video Editor by Subclip.exe"` on Windows (default install).

- `<subclip> --print-mcp-config` gives `{"url","port","enabled","token"}`: the URL and Bearer token for this MCP server. The token is a password for this computer's Subclip: it must never appear in chat, in command output you read, in logs or in reports. Never run `--print-mcp-config` bare (it prints the token) and never `cat` the file. Move it straight into the client's config without printing it, for Claude Code on macOS/Linux:

  ```sh
  F="$(mktemp)" && <subclip> --print-mcp-config --output "$F" >/dev/null 2>&1; URL="$(sed -n 's/.*"url" *: *"\([^"]*\)".*/\1/p' "$F")"; TOKEN="$(sed -n 's/.*"token" *: *"\([^"]*\)".*/\1/p' "$F")"; rm -f "$F"; claude mcp add --scope user --transport http subclip "$URL" --header "Authorization: Bearer $TOKEN" >/dev/null; unset TOKEN
  ```

  Windows (PowerShell): `$F = Join-Path $env:TEMP "subclip-mcp-$([guid]::NewGuid()).json"; Start-Process -FilePath $S -ArgumentList '--print-mcp-config','--output',$F -Wait -WindowStyle Hidden; $C = Get-Content $F -Raw | ConvertFrom-Json; Remove-Item $F; claude mcp add --scope user --transport http subclip $C.url --header "Authorization: Bearer $($C.token)" | Out-Null; Remove-Variable C`.
  Check with `claude mcp list` (no token shown); never `claude mcp get subclip` (it prints the token). Other clients: same pattern with a short script that prints nothing; if that isn't possible, ask the human to connect the client themselves (Desktop settings > Connect AI client, or they run the command).
- `<subclip> --status` prints `{running, pid, version, headless, mcp:{enabled,url,port}, signedIn, email}` (never the token). Exit 0 running, 1 not running.
- `<subclip> --stop` quits it gracefully (projects saved, work cleaned up) and waits up to 30 s. Exit 0 when gone.
- `<subclip> --restart` quits and relaunches with the same arguments; headless stays headless. Exit 0 when the new instance is up.
- `<subclip> --headless` starts a headless instance (keep it running with your service manager, nohup or similar).
- A second copy beside the first: add `--user-data-dir=<dir> --mcp-port=<port>` (1024-65535) when starting it AND to every command above for it. `SUBCLIP_MCP_PORT` works like `--mcp-port`.
- Windows: a terminal may not show the output. Add `--output <file>` and read the file, e.g. `Start-Process <subclip.exe> -ArgumentList '--status','--output','status.json' -Wait -PassThru` (the process `.ExitCode` is the exit code).
- `<subclip> --help` lists all of this.

Never stop or restart Subclip unless the human asked for it or agreed: it ends running exports and recordings.
