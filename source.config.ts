import {
	defineDocs,
	defineConfig,
	defineCollections,
} from "fumadocs-mdx/config";
import { remarkAutoTypeTable } from "fumadocs-typescript";

export const docs = defineDocs({
	dir: "content/docs",
});

export const blog = defineCollections({
	type: "doc",
	dir: "content/blog",
});

export default defineConfig({
	mdxOptions: {
		remarkPlugins: [remarkAutoTypeTable],
	},
});
