import type { ThemeMode } from "@/course/types";

export interface ThemeTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

export interface ThemeDefinition {
  id: string;
  label: string;
  description: string;
  light: ThemeTokens;
  dark: ThemeTokens;
  radius?: string;
  fontFamily?: "sans" | "serif" | "humanist" | "mono-friendly";
  readingWidth?: string;
  typeScale?: number;
}

export interface CustomThemeDefinition {
  name: string;
  light: Partial<ThemeTokens>;
  dark: Partial<ThemeTokens>;
  radius?: string;
  fontFamily?: ThemeDefinition["fontFamily"];
  readingWidth?: string;
  typeScale?: number;
}

export interface ThemeState {
  mode: ThemeMode;
  preset: string;
  customEnabled: boolean;
  custom: CustomThemeDefinition;
  learnerSelected: boolean;
}
