module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "usage",
        corejs: 2,
        targets: { node: "6" }
      }
    ],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ],
  env: {
    test: {
      plugins: ["require-context-hook"]
    }
  }
};
