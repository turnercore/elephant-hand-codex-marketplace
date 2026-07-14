import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LessonThemeSuggestion, ThemeMode } from "@/course/types";
import { courseConfig } from "@/course/course.config";
import { readJsonStorage, writeJsonStorage } from "@/lib/storage";
import { builtInThemes } from "./built-in-themes";
import { courseThemes } from "./course-themes";
import type { CustomThemeDefinition, ThemeDefinition, ThemeState, ThemeTokens } from "./types";

const STORAGE_KEY = `teach-loop:theme:${courseConfig.id}`;

const tokenVariables: Record<keyof ThemeTokens, string> = {
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  popover: "--popover",
  popoverForeground: "--popover-foreground",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  destructive: "--destructive",
  border: "--border",
  input: "--input",
  ring: "--ring",
  chart1: "--chart-1",
  chart2: "--chart-2",
  chart3: "--chart-3",
  chart4: "--chart-4",
  chart5: "--chart-5",
};

const fontFamilies: Record<NonNullable<ThemeDefinition["fontFamily"]>, string> = {
  sans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  serif: "ui-serif, Georgia, Cambria, 'Times New Roman', serif",
  humanist: "Optima, Candara, 'Noto Sans', ui-sans-serif, system-ui, sans-serif",
  "mono-friendly": "ui-sans-serif, system-ui, sans-serif",
};

function emptyCustom(): CustomThemeDefinition {
  return {
    name: "My theme",
    light: {},
    dark: {},
    radius: undefined,
    fontFamily: undefined,
    readingWidth: undefined,
    typeScale: undefined,
  };
}

const initialState: ThemeState = {
  mode: courseConfig.defaultMode,
  preset: courseConfig.defaultTheme,
  customEnabled: false,
  custom: emptyCustom(),
  learnerSelected: false,
};

interface ThemeContextValue extends ThemeState {
  definitions: ThemeDefinition[];
  resolvedMode: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  setPreset: (preset: string) => void;
  setCustomEnabled: (enabled: boolean) => void;
  setCustom: (custom: CustomThemeDefinition) => void;
  resetToCourse: () => void;
  applyLessonSuggestion: (suggestion?: LessonThemeSuggestion) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveMode(mode: ThemeMode): "light" | "dark" {
  if (mode === "light" || mode === "dark") return mode;
  return globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(() => readJsonStorage(STORAGE_KEY, initialState));
  const [systemDark, setSystemDark] = useState(() => resolveMode("system") === "dark");
  const definitions = useMemo(() => [...builtInThemes, ...courseThemes], []);
  const resolvedMode = state.mode === "system" ? (systemDark ? "dark" : "light") : state.mode;

  useEffect(() => {
    const query = globalThis.matchMedia?.("(prefers-color-scheme: dark)");
    if (!query) return undefined;
    const update = () => setSystemDark(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const definition =
      definitions.find((candidate) => candidate.id === state.preset) ??
      definitions.find((candidate) => candidate.id === courseConfig.defaultTheme) ??
      definitions[0];
    if (!definition) return;

    const root = document.documentElement;
    const baseTokens = definition[resolvedMode];
    const customTokens = state.customEnabled ? state.custom[resolvedMode] : {};
    const tokens = { ...baseTokens, ...customTokens };

    for (const [key, variable] of Object.entries(tokenVariables) as Array<[
      keyof ThemeTokens,
      string,
    ]>) {
      root.style.setProperty(variable, tokens[key]);
    }

    const radius = state.customEnabled && state.custom.radius ? state.custom.radius : definition.radius;
    const fontFamily =
      state.customEnabled && state.custom.fontFamily
        ? state.custom.fontFamily
        : definition.fontFamily ?? "sans";
    const readingWidth =
      state.customEnabled && state.custom.readingWidth
        ? state.custom.readingWidth
        : definition.readingWidth ?? "48rem";
    const typeScale =
      state.customEnabled && state.custom.typeScale
        ? state.custom.typeScale
        : definition.typeScale ?? 1;

    root.style.setProperty("--radius", radius ?? "0.8rem");
    root.style.setProperty("--font-body", fontFamilies[fontFamily]);
    root.style.setProperty("--reading-width", readingWidth);
    root.style.setProperty("--type-scale", String(typeScale));
    root.classList.toggle("dark", resolvedMode === "dark");
    root.dataset.theme = state.customEnabled ? "custom" : definition.id;
    root.style.colorScheme = resolvedMode;
    writeJsonStorage(STORAGE_KEY, state);
  }, [definitions, resolvedMode, state]);

  const setMode = useCallback((mode: ThemeMode) => {
    setState((current) => ({ ...current, mode, learnerSelected: true }));
  }, []);

  const setPreset = useCallback((preset: string) => {
    setState((current) => ({ ...current, preset, customEnabled: false, learnerSelected: true }));
  }, []);

  const setCustomEnabled = useCallback((customEnabled: boolean) => {
    setState((current) => ({ ...current, customEnabled, learnerSelected: true }));
  }, []);

  const setCustom = useCallback((custom: CustomThemeDefinition) => {
    setState((current) => ({ ...current, custom, customEnabled: true, learnerSelected: true }));
  }, []);

  const resetToCourse = useCallback(() => {
    setState({ ...initialState, custom: emptyCustom() });
  }, []);

  const applyLessonSuggestion = useCallback(
    (suggestion?: LessonThemeSuggestion) => {
      if (!suggestion) return;
      setState((current) => {
        if (current.learnerSelected) return current;
        const proposedPreset =
          suggestion.preset && suggestion.preset !== "course" ? suggestion.preset : current.preset;
        const proposedMode = suggestion.mode ?? current.mode;
        const knownPreset = definitions.some((definition) => definition.id === proposedPreset);
        return {
          ...current,
          preset: knownPreset ? proposedPreset : current.preset,
          mode: proposedMode,
        };
      });
    },
    [definitions],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...state,
      definitions,
      resolvedMode,
      setMode,
      setPreset,
      setCustomEnabled,
      setCustom,
      resetToCourse,
      applyLessonSuggestion,
    }),
    [
      applyLessonSuggestion,
      definitions,
      resetToCourse,
      resolvedMode,
      setCustom,
      setCustomEnabled,
      setMode,
      setPreset,
      state,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider.");
  return value;
}
