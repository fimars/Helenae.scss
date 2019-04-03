import Config = require("webpack-chain");
import webpackNodeExternals = require("webpack-node-externals");
import createBaseConfig from "./createBaseConfig";

import { AppContext } from "../types";
import { resolveAppPath } from "./util";

export default function(ctx: AppContext): Config {
  const config = createBaseConfig(ctx);

  config.entry("server").add(resolveAppPath("ssr"));

  config.output.filename("scripts/ssr.js");

  config.target("node");
  config.node.set("__dirname", false);

  config.externals(webpackNodeExternals());

  return config;
}
