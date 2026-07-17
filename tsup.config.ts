import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  outDir: "dist",
  sourcemap: false,
  clean: true,
  shims: true,
  banner: { js: "#!/usr/bin/env node" },
});
