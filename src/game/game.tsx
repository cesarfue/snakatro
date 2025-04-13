import * as React from "react";
import { createRoot } from "react-dom/client";
import { Snake } from "./snake";
import { Food } from "./food";

export type Position = { x: number; y: number };

const Game: React.FC = () => {
  const gridSize = 50;
  const gridWidth = Math.floor(window.innerWidth / gridSize);
  const gridHeight = Math.floor(window.innerHeight / gridSize);

  const [foodPosition, setFoodPosition] = React.useState<Position>({
    x: Math.floor(Math.random() * gridWidth),
    y: Math.floor(Math.random() * gridHeight),
  });

  const resetFoodPosition = () => {
    setFoodPosition({
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <Snake
        gridSize={gridSize}
        gridWidth={gridWidth}
        gridHeight={gridHeight}
        foodPosition={foodPosition}
        resetFoodPosition={resetFoodPosition}
      />
      <Food gridSize={gridSize} foodPosition={foodPosition} />
    </div>
  );
};

export function initGame() {
  const container = document.getElementById("game");
  if (container) {
    const root = createRoot(container);
    root.render(<Game />);
  } else {
    console.error("React overlay container not found");
  }
}
