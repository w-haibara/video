export type EasingType = "linear" | "ease-in" | "ease-out" | "ease-in-out";

export type Keyframe = {
  timeMs: number; // relative to clip start (0 = clip beginning)
  value: number; // numeric value at this point
  easing?: EasingType; // interpolation curve to NEXT keyframe (default: "linear")
};

export type KeyframeTrack = {
  property: string; // dotted path: "transform.x", "transform.scale", "volume"
  keyframes: Keyframe[];
};
