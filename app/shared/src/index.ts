// Types
export type { Asset, AssetKind, BuiltinAssetKind } from "./types/asset";
export type { Project, ProjectSettings, Sequence, Track, Clip, BuiltinClipKind, BuiltinBlendMode, BuiltinTransitionType, BuiltinVideoFilterType, ClipText, ClipTransform, ClipCrop, ClipColorCorrection, ClipTransition, ExportPreset, Marker, VideoFilter } from "./types/project";
export type { Job, JobStatus } from "./types/job";
export type { PluginManifest } from "./types/plugin";
export type { CompositeStrategyDescriptor } from "./types/composite";
export type { EasingType, Keyframe, KeyframeTrack } from "./types/keyframe";
export type { TransitionDescriptor } from "./types/transition";
export type {
  CreateProjectRequest,
  CreateProjectResponse,
  ListProjectsResponse,
  GetProjectResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
  ImportAssetResponse,
  GetJobResponse,
} from "./types/api";

// Keyframe engine
export {
  evaluateAtTime,
  easeLinear,
  easeIn,
  easeOut,
  easeInOut,
  getEasing,
  hasKeyframes,
  getAnimatedValue,
} from "./keyframe/interpolate";
export {
  getStaticValue,
} from "./keyframe/property-resolver";
export {
  buildKeyframeFilterExpression,
} from "./keyframe/ffmpeg-expression";

// Utils
export { generateId } from "./utils/id";
export { inferTrackKind } from "./utils/track";
export { migrateProject } from "./utils/migration";

// Constants
export {
  DEFAULT_IMAGE_DURATION_MS,
  DEFAULT_PROJECT_DURATION_MS,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  PROXY_WIDTH,
  PROXY_HEIGHT,
  THUMBNAIL_HEIGHT,
  JOB_POLL_INTERVAL_MS,
} from "./utils/constants";
