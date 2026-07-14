import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const mdxComponents = {
  h1: ({ className, ...props }: ComponentProps<"h1">) => (
    <h1 className={cn("mt-10 text-3xl font-semibold tracking-tight", className)} {...props} />
  ),
  h2: ({ className, ...props }: ComponentProps<"h2">) => (
    <h2 className={cn("mt-10 text-2xl font-semibold tracking-tight", className)} {...props} />
  ),
  h3: ({ className, ...props }: ComponentProps<"h3">) => (
    <h3 className={cn("mt-7 text-xl font-semibold", className)} {...props} />
  ),
  p: ({ className, ...props }: ComponentProps<"p">) => (
    <p className={cn("my-4 leading-7 text-foreground/92", className)} {...props} />
  ),
  a: ({ className, href, ...props }: ComponentProps<"a">) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        className={cn("font-medium text-primary underline decoration-primary/35 underline-offset-4 hover:decoration-primary", className)}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        {...props}
      />
    );
  },
  ul: ({ className, ...props }: ComponentProps<"ul">) => (
    <ul className={cn("my-4 list-disc space-y-2 pl-6", className)} {...props} />
  ),
  ol: ({ className, ...props }: ComponentProps<"ol">) => (
    <ol className={cn("my-4 list-decimal space-y-2 pl-6", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: ComponentProps<"blockquote">) => (
    <blockquote className={cn("my-5 border-l-4 border-primary/50 pl-4 italic text-muted-foreground", className)} {...props} />
  ),
  code: ({ className, ...props }: ComponentProps<"code">) => (
    <code className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]", className)} {...props} />
  ),
  pre: ({ className, ...props }: ComponentProps<"pre">) => (
    <pre className={cn("my-5 overflow-x-auto rounded-xl border border-border bg-muted/55 p-4 text-sm", className)} {...props} />
  ),
  table: ({ className, ...props }: ComponentProps<"table">) => (
    <div className="my-5 overflow-x-auto rounded-lg border border-border">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: ComponentProps<"th">) => (
    <th className={cn("border-b border-border bg-muted px-3 py-2 text-left font-semibold", className)} {...props} />
  ),
  td: ({ className, ...props }: ComponentProps<"td">) => (
    <td className={cn("border-b border-border px-3 py-2 align-top", className)} {...props} />
  ),
};
