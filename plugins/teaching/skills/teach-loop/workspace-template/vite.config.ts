import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { readdirSync } from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

function lessonRegistryPlugin(): Plugin {
  const publicId = "virtual:teach-loop-lessons";
  const resolvedId = `\0${publicId}`;

  return {
    name: "teach-loop-lesson-registry",
    resolveId(id) {
      return id === publicId ? resolvedId : undefined;
    },
    load(id) {
      if (id !== resolvedId) return undefined;

      const lessonsDirectory = path.resolve(__dirname, "lessons");
      const selectedId = process.env.VITE_LESSON_ID?.trim();
      const files = readdirSync(lessonsDirectory)
        .filter((file) => /^\d{4}-[a-z0-9-]+\.mdx$/.test(file))
        .filter((file) => !selectedId || file === `${selectedId}.mdx`)
        .sort();

      if (files.length === 0) {
        throw new Error(
          selectedId
            ? `No lesson found for VITE_LESSON_ID=${selectedId}`
            : "No numbered MDX lessons were found.",
        );
      }

      const imports = files
        .map((file, index) => {
          const absolutePath = path.join(lessonsDirectory, file).replaceAll("\\", "/");
          return `import Component${index}, { lesson as lesson${index} } from ${JSON.stringify(absolutePath)};`;
        })
        .join("\n");
      const entries = files
        .map((_, index) => `{ Component: Component${index}, lesson: lesson${index} }`)
        .join(",\n");

      return `${imports}\nexport const lessonModules = [${entries}];`;
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [
    lessonRegistryPlugin(),
    { enforce: "pre", ...mdx() },
    react({ include: /\.(?:js|jsx|mdx|ts|tsx)$/ }),
    tailwindcss(),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2022",
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 4000,
  },
});
