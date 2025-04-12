import * as React from "react";
import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    snakePosition: { x: number; y: number };
  }
}

window.snakePosition = { x: 100, y: 100 };

const Snake: React.FC = () => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [speed] = useState(20);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      setPosition((prev) => {
        const newPos = { ...prev };

        switch (event.key) {
          case "ArrowUp":
            newPos.y = Math.max(25, prev.y - speed); // Prevent going off the top
            break;
          case "ArrowDown":
            newPos.y = Math.min(window.innerHeight - 25, prev.y + speed); // Prevent going off the bottom
            break;
          case "ArrowLeft":
            newPos.x = Math.max(25, prev.x - speed); // Prevent going off the left
            break;
          case "ArrowRight":
            newPos.x = Math.min(window.innerWidth - 25, prev.x + speed); // Prevent going off the right
            break;
        }

        window.snakePosition = newPos;
        return newPos;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [speed]);

  return (
    <div
      style={{
        position: "absolute",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        backgroundColor: "rgba(255, 0, 0, 0.7)",
        left: `${position.x - 25}px`, // Center the circle on its position
        top: `${position.y - 25}px`,
        pointerEvents: "auto",
        transition: "left 0.1s, top 0.1s",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        userSelect: "none",
      }}
    ></div>
  );
};

const Game: React.FC = () => {
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
      <Snake />
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
