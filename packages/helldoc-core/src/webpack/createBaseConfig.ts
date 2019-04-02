import { resolve } from "path";
import Config = require("webpack-chain");

import { resolveAppPath, resolveAssetsPath } from "./util";
import { AppContext } from "../types";

const contextPath = resolve(__dirname, "../../");

export default function(ctx: AppContext) {
  const isProd = process.env.NODE_ENV === "production";
  const outDir = ctx.outDir;

  const config = new Config();

  config
    .context(contextPath)
    .mode(isProd ? "production" : "development")
    .output.path(outDir)
    .filename(
      isProd ? "assets/js/[name].[chunkhash:8].js" : "assets/js/[name].js"
    )
    .publicPath(ctx.base);

  if (!isProd) {
    config.devtool("cheap-module-eval-source-map");
  }

  const modulePaths = getModulePaths();

  config.resolve
    .symlinks(true)
    .alias.set("components", resolveAppPath("components"))
    .set("@internal", resolve(ctx.tempPath, "internal"))
    .set("@assets", resolveAssetsPath())
    .end()
    .extensions.merge([".js", ".jsx", ".md", ".scss"])
    .end()
    .modules.merge(modulePaths);

  config
    .plugin("webpack-bar")
    .use(require("webpackbar"))
    .end();

  if (isProd) {
    config.plugin("extract-css").use(require("mini-css-extract-plugin"), [
      {
        filename: "assets/css/styles.[chunkhash:8].css"
      }
    ]);

    /**
     * SplitChunks Suggest
     * From https://github.com/vuejs/vuepress/blob/master/packages/%40vuepress/core/lib/webpack/createBaseConfig.js#L267
     */
    config.optimization.splitChunks({
      cacheGroups: {
        styles: {
          chunks: "all",
          enforce: true,
          name: "styles",
          // necessary to ensure async chunks are also extracted
          test: (m: { type: string }) => {
            return /css\/mini-extract/.test(m.type);
          }
        }
      }
    });
  }

  const mdRule = config.module.rule("markdown").test(/\.md?$/);

  const babelRule = config.module.rule("babel").test(/\.js?$/);

  [mdRule, babelRule].forEach(rule =>
    rule
      .use("babel")
      .loader("babel-loader")
      .options({
        babelrc: false,
        cwd: contextPath,
        cacheDirectory: true,
        plugins: [
          ["@babel/plugin-proposal-class-properties", { loose: true }],
          "react-hot-loader/babel",
          "@babel/plugin-syntax-dynamic-import"
        ],
        presets: [
          [
            "@babel/preset-env",
            { targets: { browsers: "last 2 versions" } } // or whatever your project requires
          ],
          "@babel/preset-react"
        ]
      })
      .end()
      .exclude.add(/node_modules/)
      .end()
  );

  // handle the markdown part
  mdRule
    .use("easy-markdown-loader")
    .loader(require.resolve("./markdownLoader"))
    .end();

  const styleRule = config.module.rule("scss").test(/\.scss$/);
  if (isProd) {
    styleRule
      .use("extract-css-loader")
      .loader(require.resolve("mini-css-extract-plugin/dist/loader"));
  } else {
    styleRule.use("style-loader").loader("style-loader");
  }
  styleRule.use("css-loader").loader("css-loader");
  styleRule.use("sass-loader").loader("sass-loader");
  return config;
}

function getModulePaths() {
  return [resolve(process.cwd(), "node_modules")].concat(module.paths);
}
