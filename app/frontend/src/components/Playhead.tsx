import { theme } from "../theme";

type Props = {
  positionPx: number;
};

export function Playhead({ positionPx }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${positionPx}px`,
        top: 0,
        bottom: 0,
        width: "2px",
        background: theme.playhead,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "-5px",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: `8px solid ${theme.playhead}`,
        }}
      />
    </div>
  );
}
