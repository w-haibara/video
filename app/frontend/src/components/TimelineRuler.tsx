type Props = {
  durationMs: number;
  msToPx: (ms: number) => number;
};

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function getTickInterval(pxPerMs: number): number {
  // Choose a tick interval so ticks are roughly 80-150px apart
  const candidates = [1000, 2000, 5000, 10000, 15000, 30000, 60000];
  for (const interval of candidates) {
    const px = interval * pxPerMs;
    if (px >= 60) return interval;
  }
  return 60000;
}

export function TimelineRuler({ durationMs, msToPx }: Props) {
  const pxPerMs = msToPx(1);
  const tickInterval = getTickInterval(pxPerMs);
  const totalWidth = msToPx(durationMs);

  const ticks: number[] = [];
  for (let t = 0; t <= durationMs; t += tickInterval) {
    ticks.push(t);
  }

  return (
    <div
      style={{
        position: "relative",
        height: "24px",
        minWidth: `${totalWidth}px`,
        borderBottom: "1px solid #444",
        fontSize: "10px",
        color: "#888",
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {ticks.map((t) => (
        <div
          key={t}
          style={{
            position: "absolute",
            left: `${msToPx(t)}px`,
            top: 0,
            height: "100%",
            borderLeft: "1px solid #444",
            paddingLeft: "3px",
            lineHeight: "24px",
          }}
        >
          {formatTime(t)}
        </div>
      ))}
    </div>
  );
}
