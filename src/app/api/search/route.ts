import { createSearchAPI } from "fumadocs-core/search/server";
import { blog, source } from "@/lib/source";

const combinedSrcs = [...source.getPages(), ...blog.getPages()];

export const { GET } = createSearchAPI("advanced", {
  language: "english",
  indexes: combinedSrcs.map((page) => ({
    title: page.data.title,
    description: page.data.description,
    url: page.url,
    id: page.url,
    structuredData: page.data.structuredData,
  })),
});
