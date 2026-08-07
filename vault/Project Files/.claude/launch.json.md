---
tags: [phx-growth, source]
file: .claude/launch.json
---

# `.claude/launch.json`

Part of [[📁 Codebase]] — live copy at `~/PHX-Growth/.claude/launch.json`

````json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "phx-growth-dev",
      "runtimeExecutable": "/bin/bash",
      "runtimeArgs": ["-c", "PATH=/opt/homebrew/opt/node/bin:$PATH npm run dev"],
      "port": 3000
    }
  ]
}
````
