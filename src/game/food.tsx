import * as React from "react";
import { Position } from "./game";

interface GridProps {
  gridSize: number;
  foodPosition: Position;
}

export const Food: React.FC<GridProps> = ({ gridSize, foodPosition }) => {
  return (
    <div
      style={{
        position: "absolute",
        width: `${gridSize - 4}px`,
        height: `${gridSize - 4}px`,
        left: `${foodPosition.x * gridSize + 2}px`,
        top: `${foodPosition.y * gridSize + 2}px`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
      }}
    >
      <div
        style={{
          width: `${gridSize * 0.8}px`,
          height: `${gridSize * 0.8}px`,
          backgroundColor: "#EA4335", // Red
          borderRadius: "50%",
          position: "relative",
        }}
      >
        {/* Leaf */}
        <div
          style={{
            position: "absolute",
            top: "-15%",
            right: "20%",
            width: `${gridSize * 0.3}px`,
            height: `${gridSize * 0.25}px`,
            backgroundColor: "#34A853", // Google green
            borderRadius: "50% 50% 0 50%",
            transform: "rotate(45deg)",
          }}
        />
      </div>
    </div>
  );
};
