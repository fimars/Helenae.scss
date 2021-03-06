import { SiteData } from "../types";
// @ts-ignore
import * as $runtime from "@internal/runtime";

type Modules = { [key: string]: any };

export const siteData = $runtime.siteData as SiteData;
export const pages = $runtime.pages as Modules;
export const layouts = $runtime.layouts as Modules;
