import { docs, blog as blogPosts } from "@/.source";
import { createMDXSource } from "fumadocs-mdx";
import { loader } from "fumadocs-core/source";

// `loader()` also assign a URL to your pages
// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
	baseUrl: "/docs",
	source: docs.toFumadocsSource(),
});

export const blog = loader({
	baseUrl: "/blog",
	source: createMDXSource(blogPosts, []),
});
