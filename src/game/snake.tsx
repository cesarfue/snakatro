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

  const [segments, setSegments] = useState<Position[]>([
    { x: initialX, y: initialY },
  ]);
  const [direction, setDirection] = useState<Direction>("NONE");
  const [lastDirection, setLastDirection] = useState<Direction>("NONE");

  const directionRef = React.useRef<Direction>(direction);
  const lastDirectionRef = React.useRef<Direction>(lastDirection);
  const segmentsRef = React.useRef<Position[]>(segments);

  useEffect(() => {
    directionRef.current = direction;
    window.snakePosition = {
      x: segments[0].x * GRID_SIZE + GRID_SIZE / 2,
      y: segments[0].y * GRID_SIZE + GRID_SIZE / 2,
    };
  }, [direction, segments, GRID_SIZE]);

  useEffect(() => {
    lastDirectionRef.current = lastDirection;
  }, [lastDirection]);

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();

      const currentDirection = directionRef.current;

      switch (event.key) {
        case "ArrowUp":
          if (lastDirectionRef.current !== "DOWN") {
            setDirection("UP");
          }
          break;
        case "ArrowDown":
          if (lastDirectionRef.current !== "UP") {
            setDirection("DOWN");
          }
          break;
        case "ArrowLeft":
          if (lastDirectionRef.current !== "RIGHT") {
            setDirection("LEFT");
          }
          break;
        case "ArrowRight":
          if (lastDirectionRef.current !== "LEFT") {
            setDirection("RIGHT");
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const moveSnake = () => {
      const currentDirection = directionRef.current;

      if (currentDirection === "NONE") {
        return;
      }

      setLastDirection(currentDirection);

      setSegments((prevSegments) => {
        const head = prevSegments[0];
        let newHead: Position;

        switch (currentDirection) {
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

        return [newHead];
      });
    };

    const gameInterval = setInterval(moveSnake, MOVE_INTERVAL);
    return () => clearInterval(gameInterval);
  }, [GRID_HEIGHT, GRID_WIDTH]);

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
