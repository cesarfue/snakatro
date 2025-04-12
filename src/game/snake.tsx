import * as React from "react";
import { useState, useEffect } from "react";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT" | "NONE";
type Position = { x: number; y: number };

declare global {
  interface Window {
    snakePosition: Position;
  }
}

export const Snake: React.FC = () => {
  const GRID_SIZE = 20;
  const MOVE_INTERVAL = 150;
  const GRID_WIDTH = Math.floor(window.innerWidth / GRID_SIZE);
  const GRID_HEIGHT = Math.floor(window.innerHeight / GRID_SIZE);
  const initialX = Math.floor(GRID_WIDTH / 2);
  const initialY = Math.floor(GRID_HEIGHT / 2);

  const initialSegments = [
    { x: initialX, y: initialY },
    { x: initialX - 1, y: initialY },
    { x: initialX - 2, y: initialY },
  ];
  const [segments, setSegments] = useState<Position[]>(initialSegments);
  const [direction, setDirection] = useState<Direction>("NONE");

  useEffect(() => {
    window.snakePosition = {
      x: segments[0].x * GRID_SIZE + GRID_SIZE / 2,
      y: segments[0].y * GRID_SIZE + GRID_SIZE / 2,
    };
  }, [direction, segments, GRID_SIZE]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setDirection((direction) => {
        switch (event.key) {
          case "ArrowUp":
            if (direction !== "DOWN") {
              return "UP";
            }
            break;
          case "ArrowDown":
            if (direction !== "UP") {
              return "DOWN";
            }
            break;
          case "ArrowLeft":
            if (direction !== "RIGHT") {
              return "LEFT";
            }
            break;
          case "ArrowRight":
            if (direction !== "LEFT") {
              return "RIGHT";
            }
            break;
        }
        return direction;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const moveSnake = () => {
      setSegments((prevSegments) => {
        const head = prevSegments[0];
        let newHead: Position;

        switch (direction) {
          case "UP":
            newHead = { x: head.x, y: head.y - 1 };
            break;
          case "DOWN":
            newHead = { x: head.x, y: head.y + 1 };
            break;
          case "LEFT":
            newHead = { x: head.x - 1, y: head.y };
            break;
          case "RIGHT":
            newHead = { x: head.x + 1, y: head.y };
            break;
          default:
            newHead = { ...head };
            break;
        }

        if (newHead.x < 0) newHead.x = GRID_WIDTH - 1;
        if (newHead.x >= GRID_WIDTH) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_HEIGHT - 1;
        if (newHead.y >= GRID_HEIGHT) newHead.y = 0;

        const newSegments = [
          newHead,
          ...prevSegments.slice(0, prevSegments.length - 1),
        ];
        return newSegments;
      });
    };

    const gameInterval = setInterval(moveSnake, MOVE_INTERVAL);
    return () => clearInterval(gameInterval);
  }, [GRID_HEIGHT, GRID_WIDTH, direction]);

  return (
    <>
      {segments.map((segment, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            width: `${GRID_SIZE - 2}px`,
            height: `${GRID_SIZE - 2}px`,
            backgroundColor:
              index === 0 ? "rgba(255, 0, 0, 0.7)" : "rgba(255, 0, 0, 0.5)",
            left: `${segment.x * GRID_SIZE}px`,
            top: `${segment.y * GRID_SIZE}px`,
            pointerEvents: "auto",
            transition: "none",
            userSelect: "none",
          }}
        />
      ))}
    </>
  );
};
