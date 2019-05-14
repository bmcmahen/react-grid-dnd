module.exports = async ({ config, mode }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: require.resolve("babel-loader")
      },
      {
        loader: require.resolve("awesome-typescript-loader")
      }
    ]
  });

  config.resolve.extensions.push(".ts", ".tsx", ".json");
  return config;
};
