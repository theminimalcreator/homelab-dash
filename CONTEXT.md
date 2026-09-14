# Homelab Dashboard

Next.js app that monitors a small homelab built from repurposed Android phones ("Nodes") running Termux. It polls each Node's stats endpoint and renders live status for the whole Cluster.

## Language

**Node**:
A physical Android phone repurposed to run part of the homelab, reachable over the local network via Termux.
_Avoid_: Device, phone, server

**Master**:
The Node that hosts the dashboard app itself and runs other long-lived processes via PM2, directly in Termux with no extra Linux layer. Currently the Poco X3 GT. The name reflects its role as the primary, always-on Node — it does not orchestrate or control other Nodes.
_Avoid_: Host node, primary node

**Dev Node**:
A Node that runs Alpine Linux inside Termux (via proot) to support dev tooling that needs a fuller Linux environment, like Claude Code. Currently the Redmi Note 12 5G. Does not run the dashboard itself.
_Avoid_: Alpine node, worker node

**Service**:
A PM2-managed process running on the Master, tracked by name, status, CPU, memory, and restart count.
_Avoid_: Process, app

**Cluster**:
The full set of Nodes the dashboard monitors and displays together.

**Node Stats**:
The metrics payload a Node's stats endpoint returns: hardware info (total/free memory, load average, uptime) and, for the Master, the current list of Services.
_Avoid_: Metrics, telemetry

**Agent**:
The minimal standalone HTTP server that runs on a Node other than the Master and exposes that Node's Node Stats on port 3001. Currently runs on the Dev Node.
_Avoid_: Server, daemon
