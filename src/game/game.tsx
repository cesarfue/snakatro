import * as React from "react";
import { createRoot } from "react-dom/client";
import { useState, useEffect, useRef } from "react";
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

  const [gamePaused, setGamePaused] = useState(true);
  const gamePausedRef = useRef(true);

  const togglePause = () => {
    setGamePaused((prev) => {
      const next = !prev;
      gamePausedRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gamePausedRef.current) {
        if (event.key === "Escape" || event.key === " ") togglePause();
      } else {
        if (
          event.key === "ArrowUp" ||
          event.key === "ArrowDown" ||
          event.key === "ArrowLeft" ||
          event.key === "ArrowRight" ||
          event.key === " " ||
          event.key === "Escape"
        )
          togglePause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "auto",
        }}
      >
        <Snake
          gridSize={gridSize}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          foodPosition={foodPosition}
          resetFoodPosition={resetFoodPosition}
          gamePausedRef={gamePausedRef}
        />
        <Food gridSize={gridSize} foodPosition={foodPosition} />
        {gamePaused && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              height: "100%",
              zIndex: 999,
            }}
          >
            <button
              onClick={togglePause}
              style={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "60px",
                padding: "20px 40px",
                backgroundColor: "transparent",
                border: "none",
                color: "black",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              ▶
            </button>
          </div>
        )}
      </div>
    </>
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
