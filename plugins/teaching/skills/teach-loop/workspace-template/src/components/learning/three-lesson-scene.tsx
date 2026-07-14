import { BoxIcon, CheckIcon, RotateCcwIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEvidence } from "@/evidence/evidence-context";
import { LearningCard } from "./learning-card";

export interface ThreeSetupContext {
  container: HTMLDivElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  requestRender: () => void;
  startLoop: (tick?: (time: number) => void) => void;
  stopLoop: () => void;
}

export interface ThreeExperience<TState> {
  update?: (state: TState) => void;
  reset?: () => void;
  dispose?: () => void;
}

interface ThreeCanvasProps<TState> {
  state: TState;
  setup: (context: ThreeSetupContext) => ThreeExperience<TState> | void;
  accessibleSummary: string;
  cameraPosition?: [number, number, number];
  className?: string;
  onReady?: () => void;
  resetSignal?: number;
}

export function ThreeCanvas<TState>({
  state,
  setup,
  accessibleSummary,
  cameraPosition = [5, 4, 6],
  className,
  onReady,
  resetSignal = 0,
}: ThreeCanvasProps<TState>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglError, setWebglError] = useState<string | null>(null);
  const experienceRef = useRef<ThreeExperience<TState> | void>(undefined);
  const renderRef = useRef<(() => void) | null>(null);
  const initialCamera = useRef(cameraPosition);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    setWebglError(null);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.05, 1000);
    camera.position.set(...initialCamera.current);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      setWebglError("Interactive 3D is unavailable in this browser or device. Use the text summary and controls below; your lesson remains fully usable.");
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    const applySceneBackground = () => {
      const sceneBackground = getComputedStyle(document.documentElement)
        .getPropertyValue("--scene-background")
        .trim() || "#101721";
      renderer.setClearColor(sceneBackground, 1);
    };
    applySceneBackground();
    const themeObserver = new MutationObserver(() => {
      applySceneBackground();
      renderer.render(scene, camera);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    container.append(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);

    let frame = 0;
    let looping = false;
    let loopTick: ((time: number) => void) | undefined;

    const render = () => {
      controls.update();
      renderer.render(scene, camera);
    };
    renderRef.current = render;

    const loop = (time: number) => {
      if (!looping) return;
      loopTick?.(time);
      render();
      frame = requestAnimationFrame(loop);
    };
    const startLoop = (tick?: (time: number) => void) => {
      loopTick = tick;
      if (looping) return;
      looping = true;
      frame = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      looping = false;
      cancelAnimationFrame(frame);
    };

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    controls.addEventListener("change", render);

    experienceRef.current = setup({
      container,
      scene,
      camera,
      renderer,
      controls,
      requestRender: render,
      startLoop,
      stopLoop,
    });
    resize();
    onReady?.();

    return () => {
      stopLoop();
      observer.disconnect();
      themeObserver.disconnect();
      controls.removeEventListener("change", render);
      controls.dispose();
      experienceRef.current?.dispose?.();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material?.dispose?.();
      });
      renderer.dispose();
      renderer.domElement.remove();
      renderRef.current = null;
    };
  }, [onReady, setup]);

  useEffect(() => {
    experienceRef.current?.update?.(state);
    renderRef.current?.();
  }, [state]);

  useEffect(() => {
    experienceRef.current?.reset?.();
    renderRef.current?.();
  }, [resetSignal]);

  return (
    <div
      ref={containerRef}
      className={className ?? "relative aspect-[4/3] min-h-72 overflow-hidden rounded-lg border border-border bg-[var(--scene-background)]"}
      role="img"
      aria-label={accessibleSummary}
    >
      {webglError ? (
        <div
          data-three-status="fallback"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted p-6 text-center"
        >
          <BoxIcon className="text-primary" aria-hidden="true" />
          <p className="font-semibold">3D view unavailable</p>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{webglError}</p>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">{accessibleSummary}</p>
        </div>
      ) : null}
    </div>
  );
}

interface ThreeLessonSceneProps<TState> {
  id: string;
  title: string;
  prompt: string;
  accessibleSummary: string;
  state: TState;
  setup: (context: ThreeSetupContext) => ThreeExperience<TState> | void;
  cameraPosition?: [number, number, number];
  children?: ReactNode;
}

export function ThreeLessonScene<TState>({
  id,
  title,
  prompt,
  accessibleSummary,
  state,
  setup,
  cameraPosition,
  children,
}: ThreeLessonSceneProps<TState>) {
  const { recordEvent, markComplete, snapshot } = useEvidence();
  const [resetSignal, setResetSignal] = useState(0);
  const completed = snapshot.completedIds.includes(id);
  return (
    <LearningCard
      id={id}
      title={title}
      description={prompt}
      icon={<BoxIcon aria-hidden="true" />}
      footer={
        <>
          <Button
            type="button"
            variant={completed ? "secondary" : "default"}
            onClick={() => markComplete(id, { action: "learner_marked_explored" })}
          >
            <CheckIcon data-icon="inline-start" aria-hidden="true" />
            {completed ? "Exploration recorded" : "I explored the scene"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setResetSignal((value) => value + 1);
              recordEvent(id, "interaction", { action: "reset_view" });
            }}
          >
            <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
            Reset view
          </Button>
        </>
      }
    >
      <ThreeCanvas
        state={state}
        setup={setup}
        accessibleSummary={accessibleSummary}
        cameraPosition={cameraPosition}
        resetSignal={resetSignal}
      />
      <div className="pointer-events-none -mt-12 ml-3 w-fit rounded-md bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
        Drag to orbit · scroll or pinch to zoom
      </div>
      {children}
      <details className="rounded-lg bg-muted/45 p-3 text-sm text-muted-foreground">
        <summary className="cursor-pointer font-medium text-foreground">Text and non-3D summary</summary>
        <p className="mt-2 leading-relaxed">{accessibleSummary}</p>
      </details>
    </LearningCard>
  );
}

interface VectorState {
  angle: number;
  magnitude: number;
}

function makeLine(color: THREE.ColorRepresentation, dashed = false): THREE.Line {
  const geometry = new THREE.BufferGeometry();
  const material = dashed
    ? new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08 })
    : new THREE.LineBasicMaterial({ color });
  return new THREE.Line(geometry, material);
}

function setLine(line: THREE.Line, start: THREE.Vector3, end: THREE.Vector3): void {
  line.geometry.dispose();
  line.geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  if (line.material instanceof THREE.LineDashedMaterial) line.computeLineDistances();
}

interface VectorProjectionDemoProps {
  id: string;
  title?: string;
}

export function VectorProjectionDemo({ id, title = "Vector projection playground" }: VectorProjectionDemoProps) {
  const { recordEvent, markComplete } = useEvidence();
  const [angle, setAngle] = useState(45);
  const [magnitude, setMagnitude] = useState(2.4);
  const [visitedSigns, setVisitedSigns] = useState<Set<string>>(() => new Set(["positive"]));
  const [resetSignal, setResetSignal] = useState(0);
  const dot = 2.8 * magnitude * Math.cos((angle * Math.PI) / 180);
  const sign = dot > 0.02 ? "positive" : dot < -0.02 ? "negative" : "near zero";
  const state = useMemo<VectorState>(() => ({ angle, magnitude }), [angle, magnitude]);

  const setup = useCallback((context: ThreeSetupContext): ThreeExperience<VectorState> => {
    const { scene, camera, controls, requestRender } = context;
    camera.position.set(4.8, 4.2, 6);
    controls.target.set(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const directional = new THREE.DirectionalLight(0xffffff, 1.4);
    directional.position.set(4, 7, 5);
    scene.add(directional);

    const grid = new THREE.GridHelper(8, 16, 0x526174, 0x263342);
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);
    scene.add(new THREE.AxesHelper(3.4));

    const origin = new THREE.Vector3(0, 0, 0);
    const aEnd = new THREE.Vector3(2.8, 0, 0);
    const lineA = makeLine(0x8b5cf6);
    const lineB = makeLine(0x22c55e);
    const lineProjection = makeLine(0xf59e0b);
    const lineDrop = makeLine(0x94a3b8, true);
    scene.add(lineA, lineB, lineProjection, lineDrop);

    const sphereGeometry = new THREE.SphereGeometry(0.09, 20, 20);
    const aMarker = new THREE.Mesh(sphereGeometry, new THREE.MeshStandardMaterial({ color: 0x8b5cf6 }));
    aMarker.position.copy(aEnd);
    const bMarker = new THREE.Mesh(sphereGeometry.clone(), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
    scene.add(aMarker, bMarker);

    const update = ({ angle: nextAngle, magnitude: nextMagnitude }: VectorState) => {
      const radians = (nextAngle * Math.PI) / 180;
      const bEnd = new THREE.Vector3(
        nextMagnitude * Math.cos(radians),
        nextMagnitude * Math.sin(radians),
        0,
      );
      const projection = new THREE.Vector3(bEnd.x, 0, 0);
      setLine(lineA, origin, aEnd);
      setLine(lineB, origin, bEnd);
      setLine(lineProjection, origin, projection);
      setLine(lineDrop, bEnd, projection);
      bMarker.position.copy(bEnd);
      requestRender();
    };

    update({ angle: 45, magnitude: 2.4 });
    return {
      update,
      reset: () => {
        camera.position.set(4.8, 4.2, 6);
        controls.target.set(0, 0, 0);
        controls.update();
      },
    };
  }, []);

  const commit = useCallback(
    (nextAngle: number, nextMagnitude: number) => {
      const nextDot = 2.8 * nextMagnitude * Math.cos((nextAngle * Math.PI) / 180);
      const nextSign = nextDot > 0.02 ? "positive" : nextDot < -0.02 ? "negative" : "near-zero";
      recordEvent(id, "interaction", {
        action: "vector_parameters",
        angle: nextAngle,
        magnitude: nextMagnitude,
        dot: Number(nextDot.toFixed(3)),
        sign: nextSign,
      });
      setVisitedSigns((current) => {
        const next = new Set(current);
        next.add(nextSign);
        if (next.has("positive") && next.has("negative")) markComplete(id, { testedSigns: [...next] });
        return next;
      });
    },
    [id, markComplete, recordEvent],
  );

  const summary = useMemo(
    () =>
      `Vector A points along positive x with length 2.8. Vector B has length ${magnitude.toFixed(1)} at ${angle} degrees. Their dot product is ${dot.toFixed(2)}, which is ${sign}. The amber segment shows B's signed projection along A's axis.`,
    [angle, dot, magnitude, sign],
  );

  return (
    <LearningCard
      id={id}
      title={title}
      description="Change direction and magnitude. Test at least one positive and one negative dot-product case."
      icon={<BoxIcon aria-hidden="true" />}
      footer={
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Cases tested:</span>
          {[...visitedSigns].map((value) => (
            <span key={value} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
              {value}
            </span>
          ))}
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
        <ThreeCanvas
          state={state}
          setup={setup}
          accessibleSummary={summary}
          cameraPosition={[4.8, 4.2, 6]}
          resetSignal={resetSignal}
        />
        <div className="flex flex-col gap-5 rounded-lg border border-border p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={`${id}-angle`}>Vector B angle</Label>
              <span className="text-sm tabular-nums text-muted-foreground">{angle}°</span>
            </div>
            <Slider
              id={`${id}-angle`}
              min={-180}
              max={180}
              step={5}
              value={[angle]}
              onValueChange={([value]) => setAngle(value ?? 0)}
              onValueCommit={([value]) => commit(value ?? 0, magnitude)}
              aria-label="Vector B angle"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={`${id}-magnitude`}>Vector B length</Label>
              <span className="text-sm tabular-nums text-muted-foreground">{magnitude.toFixed(1)}</span>
            </div>
            <Slider
              id={`${id}-magnitude`}
              min={0.5}
              max={3.5}
              step={0.1}
              value={[magnitude]}
              onValueChange={([value]) => setMagnitude(value ?? 0.5)}
              onValueCommit={([value]) => commit(angle, value ?? 0.5)}
              aria-label="Vector B magnitude"
            />
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Current result</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{dot.toFixed(2)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Dot product is {sign}.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setAngle(45);
              setMagnitude(2.4);
              setVisitedSigns(new Set(["positive"]));
              setResetSignal((value) => value + 1);
              recordEvent(id, "interaction", { action: "reset_parameters" });
            }}
          >
            <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
            Reset parameters
          </Button>
        </div>
      </div>
      <p className="rounded-lg bg-muted/45 p-3 text-sm leading-relaxed text-muted-foreground">{summary}</p>
    </LearningCard>
  );
}
