# Alpine (via proot) only on the Dev Node, not the Master

The Dev Node (Redmi Note 12 5G) runs Alpine Linux inside Termux through proot so it can run Claude Code and other tooling that expects a fuller Linux environment. The Master (Poco X3 GT) runs everything directly in Termux, with no proot layer, since it only needs to host the dashboard and PM2 services.

This keeps the proot overhead confined to the one Node that actually needs Linux-native tooling, rather than paying it everywhere.
