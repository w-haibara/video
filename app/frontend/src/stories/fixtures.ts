import { QueryClient } from "@tanstack/react-query";
import type { Asset, Clip, Job, Project } from "@video/shared";

// ── Factory functions ──

export const mockAsset = (overrides?: Partial<Asset>): Asset => ({
  id: "asset-1",
  kind: "video",
  originalPath: "/videos/sample.mp4",
  proxyPath: "/proxy/sample.mp4",
  thumbnailPath: "/thumb/sample.jpg",
  width: 1920,
  height: 1080,
  durationMs: 10000,
  ...overrides,
});

export const mockClip = (overrides?: Partial<Clip>): Clip => ({
  id: "clip-1",
  assetId: "asset-1",
  startMs: 0,
  durationMs: 5000,
  inMs: 0,
  outMs: 5000,
  ...overrides,
});

export const mockProject = (overrides?: Partial<Project>): Project => ({
  id: "proj-1",
  name: "My Video Project",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  assets: [mockAsset()],
  sequence: {
    tracks: [
      { id: "track-v", kind: "video", clips: [mockClip()] },
      { id: "track-a", kind: "audio", clips: [] },
    ],
  },
  settings: { durationMs: 30000, canvasWidth: 1920, canvasHeight: 1080 },
  ...overrides,
});

export const mockJob = (overrides?: Partial<Job>): Job => ({
  id: "job-1",
  projectId: "proj-1",
  assetId: "asset-1",
  status: "completed",
  progress: 1.0,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  ...overrides,
});

// ── Presets ──

export const projectWithClips: Project = {
  ...mockProject({ name: "Test Project", createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" }),
  assets: [
    mockAsset({
      id: "asset-v1",
      originalPath: "/media/video1.mp4",
      hasAudio: true,
    }),
    mockAsset({
      id: "asset-a1",
      kind: "audio",
      originalPath: "/media/audio1.mp3",
      thumbnailPath: undefined,
      width: undefined,
      height: undefined,
      durationMs: 15000,
    }),
  ],
  sequence: {
    tracks: [
      {
        id: "track-v",
        kind: "video",
        clips: [
          mockClip({
            id: "clip-v1",
            assetId: "asset-v1",
            durationMs: 10000,
            outMs: 10000,
          }),
        ],
      },
      {
        id: "track-a",
        kind: "audio",
        clips: [
          mockClip({
            id: "clip-a1",
            assetId: "asset-a1",
            startMs: 2000,
            durationMs: 8000,
            inMs: 0,
            outMs: 8000,
            volume: 0.8,
          }),
        ],
      },
    ],
  },
};

export const projectWithTextOverlay: Project = {
  ...mockProject({ name: "Test Project" }),
  assets: [
    mockAsset({
      id: "asset-v1",
      originalPath: "/media/video1.mp4",
      hasAudio: true,
    }),
  ],
  sequence: {
    tracks: [
      {
        id: "track-v",
        kind: "video",
        clips: [
          mockClip({
            id: "clip-v1",
            assetId: "asset-v1",
            durationMs: 10000,
            outMs: 10000,
          }),
        ],
      },
      {
        id: "track-t",
        kind: "title",
        clips: [
          mockClip({
            id: "clip-t",
            assetId: "",
            durationMs: 5000,
            outMs: 5000,
            text: {
              value: "Sample Title",
              fontSize: 48,
              color: "#FFFFFF",
              backgroundColor: "rgba(0,0,0,0.5)",
            },
          }),
        ],
      },
    ],
  },
  settings: { durationMs: 10000, canvasWidth: 1920, canvasHeight: 1080 },
};

// ── Shared QueryClient ──

export const createStoryQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// ── Shared conversion functions for timeline stories ──

export const storyMsToPx = (ms: number) => ms * 0.05;
export const storyPxToMs = (px: number) => px / 0.05;
