import type { CardProps } from "fumadocs-ui/components/card";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { icons } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import { createElement, type ReactNode } from "react";

const { Card: FumaCard } = defaultMdxComponents;

function resolveIcon(icon: string | ReactNode): ReactNode {
  if (typeof icon !== "string" || !(icon in icons)) return icon;
  return createElement(icons[icon as keyof typeof icons]);
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Card: function CardWithIcon({ children, icon, ...rest }: CardProps) {
      return (
        <FumaCard {...rest} icon={resolveIcon(icon)}>
          {children}
        </FumaCard>
      );
    },
    ...components,
  };
}
