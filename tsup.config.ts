import { defineConfig } from "tsup";

export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["./src/index.ts", "./src/bin/cli.ts"],
  dts: true,
  clean: true,
  shims: true,
  skipNodeModulesBundle: true,
  minify: true,
  sourcemap: true,
  target: "node14",
});
