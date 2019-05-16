import resolve from "rollup-plugin-node-resolve";
import filesize from "rollup-plugin-filesize";
import pkg from "./package.json";
import commonjs from "rollup-plugin-commonjs";
import cleanup from "rollup-plugin-cleanup";
import json from "rollup-plugin-json";
import typescript from "rollup-plugin-typescript2";

const input = "src/index.ts";

const plugins = [
  resolve(),
  typescript({
    typescript: require("typescript")
  }),
  commonjs(),
  json(),
  cleanup(),
  filesize()
];

const externals = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
];

export default [
  {
    input,
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true
      }
    ],
    external: externals,
    plugins
  }
];
