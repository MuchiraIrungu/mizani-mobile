module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // unstable_transformImportMeta: zustand's ESM build uses import.meta,
      // which crashes the bundle on web unless Babel rewrites it.
      ["babel-preset-expo", { jsxImportSource: "nativewind", unstable_transformImportMeta: true }],
      "nativewind/babel",
    ],
  };
};
