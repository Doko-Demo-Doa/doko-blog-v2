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
    });
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkAutoTypeTable],
  },
});
