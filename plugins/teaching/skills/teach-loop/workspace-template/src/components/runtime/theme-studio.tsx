import { CheckIcon, CopyIcon, PaletteIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { copyText } from "@/lib/download";
import { useTheme } from "@/themes/theme-provider";
import type { CustomThemeDefinition, ThemeTokens } from "@/themes/types";

const fallback = {
  light: {
    background: "#fafafa",
    foreground: "#1d1b22",
    primary: "#6d43c7",
    primaryForeground: "#ffffff",
    accent: "#eee8ff",
    accentForeground: "#2e1761",
    border: "#ded9e8",
  },
  dark: {
    background: "#15131a",
    foreground: "#f2eff8",
    primary: "#bba0ff",
    primaryForeground: "#1d103b",
    accent: "#352856",
    accentForeground: "#f2edff",
    border: "#443d50",
  },
};

function colorValue(value: string | undefined, fallbackValue: string): string {
  return value?.startsWith("#") && (value.length === 7 || value.length === 4) ? value : fallbackValue;
}

export function ThemeStudio() {
  const { custom, customEnabled, setCustom, setCustomEnabled } = useTheme();
  const [status, setStatus] = useState("");
  const editable = useMemo<CustomThemeDefinition>(
    () => ({
      ...custom,
      light: {
        ...custom.light,
        background: colorValue(custom.light.background, fallback.light.background),
        foreground: colorValue(custom.light.foreground, fallback.light.foreground),
        primary: colorValue(custom.light.primary, fallback.light.primary),
        primaryForeground: colorValue(custom.light.primaryForeground, fallback.light.primaryForeground),
        accent: colorValue(custom.light.accent, fallback.light.accent),
        accentForeground: colorValue(custom.light.accentForeground, fallback.light.accentForeground),
        border: colorValue(custom.light.border, fallback.light.border),
      },
      dark: {
        ...custom.dark,
        background: colorValue(custom.dark.background, fallback.dark.background),
        foreground: colorValue(custom.dark.foreground, fallback.dark.foreground),
        primary: colorValue(custom.dark.primary, fallback.dark.primary),
        primaryForeground: colorValue(custom.dark.primaryForeground, fallback.dark.primaryForeground),
        accent: colorValue(custom.dark.accent, fallback.dark.accent),
        accentForeground: colorValue(custom.dark.accentForeground, fallback.dark.accentForeground),
        border: colorValue(custom.dark.border, fallback.dark.border),
      },
      radius: custom.radius ?? "0.8rem",
      fontFamily: custom.fontFamily ?? "sans",
      readingWidth: custom.readingWidth ?? "48rem",
      typeScale: custom.typeScale ?? 1,
    }),
    [custom],
  );

  const updateColor = (mode: "light" | "dark", token: keyof ThemeTokens, value: string) => {
    setCustom({ ...editable, [mode]: { ...editable[mode], [token]: value } });
  };

  const colors: Array<{ token: keyof ThemeTokens; label: string }> = [
    { token: "background", label: "Background" },
    { token: "foreground", label: "Text" },
    { token: "primary", label: "Primary" },
    { token: "accent", label: "Accent" },
    { token: "border", label: "Border" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <PaletteIcon data-icon="inline-start" aria-hidden="true" />
          Theme Studio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Theme Studio</DialogTitle>
          <DialogDescription>
            Tune the course for comfortable reading. Custom settings stay local and travel in your lesson return.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
          <div>
            <p className="font-medium">Use custom theme</p>
            <p className="text-sm text-muted-foreground">Switch between the preset and your custom tokens.</p>
          </div>
          <Switch checked={customEnabled} onCheckedChange={setCustomEnabled} aria-label="Use custom theme" />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {(["light", "dark"] as const).map((mode) => (
            <fieldset key={mode} className="flex flex-col gap-3 rounded-lg border border-border p-4">
              <legend className="px-1 font-semibold capitalize">{mode} palette</legend>
              {colors.map(({ token, label }) => {
                const value = editable[mode][token] as string;
                return (
                  <div key={token} className="grid grid-cols-[1fr_auto] items-center gap-3">
                    <Label htmlFor={`${mode}-${token}`}>{label}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`${mode}-${token}`}
                        type="color"
                        value={value}
                        className="size-10 cursor-pointer p-1"
                        onChange={(event) => updateColor(mode, token, event.target.value)}
                      />
                      <code className="w-16 text-xs text-muted-foreground">{value}</code>
                    </div>
                  </div>
                );
              })}
            </fieldset>
          ))}
        </div>

        <div className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="theme-font">Reading typeface</Label>
            <select
              id="theme-font"
              value={editable.fontFamily}
              onChange={(event) => setCustom({ ...editable, fontFamily: event.target.value as CustomThemeDefinition["fontFamily"] })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="sans">System sans</option>
              <option value="serif">Editorial serif</option>
              <option value="humanist">Humanist</option>
              <option value="mono-friendly">Code-friendly sans</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="theme-width">Reading width</Label>
            <select
              id="theme-width"
              value={editable.readingWidth}
              onChange={(event) => setCustom({ ...editable, readingWidth: event.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="40rem">Narrow</option>
              <option value="48rem">Comfortable</option>
              <option value="56rem">Wide</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="type-scale">Text scale</Label>
              <span className="text-sm tabular-nums text-muted-foreground">{Math.round((editable.typeScale ?? 1) * 100)}%</span>
            </div>
            <Slider
              id="type-scale"
              min={0.9}
              max={1.2}
              step={0.02}
              value={[editable.typeScale ?? 1]}
              onValueChange={([value]) => setCustom({ ...editable, typeScale: value ?? 1 })}
            />
          </div>
        </div>

        {status ? <p className="text-sm text-muted-foreground" aria-live="polite">{status}</p> : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              const copied = await copyText(JSON.stringify(editable, null, 2));
              setStatus(copied ? "Theme JSON copied." : "Copy failed; use the lesson return instead.");
            }}
          >
            <CopyIcon data-icon="inline-start" aria-hidden="true" />
            Copy theme JSON
          </Button>
          <Button type="button" onClick={() => { setCustom(editable); setStatus("Custom theme applied."); }}>
            <CheckIcon data-icon="inline-start" aria-hidden="true" />
            Apply custom theme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
