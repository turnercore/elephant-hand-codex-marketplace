import { LaptopIcon, MoonIcon, PaletteIcon, RotateCcwIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ThemeMode } from "@/course/types";
import { useTheme } from "@/themes/theme-provider";
import { ThemeStudio } from "./theme-studio";

const modeOptions: Array<{ id: ThemeMode; label: string; Icon: typeof SunIcon }> = [
  { id: "system", label: "System", Icon: LaptopIcon },
  { id: "light", label: "Light", Icon: SunIcon },
  { id: "dark", label: "Dark", Icon: MoonIcon },
];

export function ThemeMenu() {
  const { mode, preset, definitions, customEnabled, setMode, setPreset, resetToCourse } = useTheme();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Theme and reading settings">
          <PaletteIcon aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,23rem)]">
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-semibold">Appearance</p>
            <p className="text-sm text-muted-foreground">Comfortable defaults, yours to reshape.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {modeOptions.map(({ id, label, Icon }) => (
              <Button
                key={id}
                type="button"
                size="sm"
                variant={mode === id ? "secondary" : "outline"}
                aria-pressed={mode === id}
                onClick={() => setMode(id)}
              >
                <Icon data-icon="inline-start" aria-hidden="true" />
                {label}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {definitions.map((theme) => (
              <Button
                key={theme.id}
                type="button"
                variant={!customEnabled && preset === theme.id ? "secondary" : "outline"}
                className="h-auto items-start justify-start py-3 text-left"
                aria-pressed={!customEnabled && preset === theme.id}
                onClick={() => setPreset(theme.id)}
              >
                <span className="flex flex-col gap-0.5 whitespace-normal">
                  <span>{theme.label}</span>
                  <span className="text-xs font-normal text-muted-foreground">{theme.description}</span>
                </span>
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <ThemeStudio />
            <Button type="button" variant="ghost" size="sm" onClick={resetToCourse}>
              <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
              Course default
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
