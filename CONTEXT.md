# Homelab Dashboard

Next.js app that monitors a small homelab of heterogeneous machines ("Nodes") — repurposed Android phones running Termux today, plus a VPS. It aggregates every Node's stats server-side and renders live status for the whole Cluster.

## Language

**Node**:
Any machine the Cluster monitors, registered in the `nodes` table (managed via the `/nodes` CRUD screen) with a `kind` describing what it is — e.g. `termux-master`, `termux-dev`, `linux-vps`. Not necessarily a phone: a VPS is a Node too. What a Node can report (Claude Code activity, wake lock, which Service runtime it uses) is driven by per-Node capability flags in that same row, not by hardcoded branches per `kind`.
_Avoid_: Device, phone, server, host

**Master**:
The Node that hosts the dashboard app itself (the one Node flagged `is_self` in the `nodes` table) and runs other long-lived processes via PM2, directly in Termux with no extra Linux layer. Currently the Poco X3 GT. The name reflects its role as the primary, always-on Node and the hub every other Node's peer-latency check pings — it does not orchestrate or control other Nodes.
_Avoid_: Host node, primary node

**Dev Node**:
A Node that runs Alpine Linux inside Termux (via proot) to support dev tooling that needs a fuller Linux environment, like Claude Code. Currently the Redmi Note 12 5G. Does not run the dashboard itself.
_Avoid_: Alpine node, worker node

**Service**:
A managed process running on a Node, tracked by name, status, CPU, memory, and restart count, plus which `runtime` reports it: `pm2` (the phones) or `docker` (a Node like the VPS that reports containers instead). A Node's `services_runtime` field says which source (if any — `none` is valid) it collects from.
_Avoid_: Process, app

**Cluster**:
The full set of Nodes the dashboard monitors and displays together.

**Node Stats**:
The metrics payload a Node's stats endpoint returns: hardware info (total/free memory, load average, uptime) and, if that Node's `services_runtime` isn't `none`, its current list of Services.
_Avoid_: Metrics, telemetry

**Agent**:
The minimal standalone HTTP server that runs on a Node other than the Master and exposes that Node's Node Stats over HTTP, authenticated by a per-Node token (the `auth_token` column) sent as `X-Node-Token`. Runs on the Dev Node today (port 3001) and will run on the VPS too — the port isn't fixed cluster-wide, each Node's `stats_url` says where to reach it.
_Avoid_: Server, daemon
