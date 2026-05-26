import { blog as blogPosts, docs } from "fumadocs-mdx:collections/server";
import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import { icons } from "lucide-react";
import { createElement } from "react";

function resolveIcon(icon: string | undefined) {
  if (icon && icon in icons) {
    return createElement(icons[icon as keyof typeof icons]);
  }
  return null;
}

// `loader()` also assign a URL to your pages
// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  icon: resolveIcon,
});

export const blog = loader({
  baseUrl: "/blog",
  source: toFumadocsSource(blogPosts, []),
});
