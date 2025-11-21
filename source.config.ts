import { remarkDirectiveAdmonition } from "fumadocs-core/mdx-plugins";
import {
  defineCollections,
  defineConfig,
  defineDocs,
} from "fumadocs-mdx/config";
import { remarkAutoTypeTable } from "fumadocs-typescript";
import { z } from "zod";

export const docs = defineDocs({
  dir: "content/docs",
});

export const blog = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: () => {
    return z.object({
      title: z.string(),
      description: z.string(),
      author: z.string(),
      date: z.date(),
      tags: z.array(z.string()),
    });
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkAutoTypeTable, remarkDirectiveAdmonition],
    rehypeCodeOptions: {
      langs: ["ts", "js", "html", "tsx", "mdx", "objective-cpp"],
      themes: {
        light: "catppuccin-latte",
        dark: "catppuccin-mocha",
      },
    },
  },
});
