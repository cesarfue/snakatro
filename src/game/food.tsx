import * as React from "react";
import { Position } from "./game";

interface GridProps {
  gridSize: number;
  foodPosition: Position;
}

export const Food: React.FC<GridProps> = ({ gridSize, foodPosition }) => {
  return (
    <>
      <div
        style={{
          position: "absolute",
          width: `${gridSize - 2}px`,
          height: `${gridSize - 2}px`,
          backgroundColor: "rgba(255, 0, 0, 0.7)",
          left: `${foodPosition.x * gridSize}px`,
          top: `${foodPosition.y * gridSize}px`,
          pointerEvents: "auto",
          userSelect: "none",
        }}
      />
    </>
  );
};
