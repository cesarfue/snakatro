import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Position } from "./game";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT" | "NONE";

interface GridProps {
  gridSize: number;
  gridWidth: number;
  gridHeight: number;
  foodPosition: Position;
  resetFoodPosition: () => void;
}

declare global {
  interface Window {
    snakePosition: Position;
  }
}

export const Snake: React.FC<GridProps> = ({
  gridSize,
  gridWidth,
  gridHeight,
  foodPosition,
  resetFoodPosition,
}) => {
  const MOVE_INTERVAL = 100;
  const initialX = Math.floor(gridWidth / 2);
  const initialY = Math.floor(gridHeight / 2);

  const initialSegments = [
    { x: initialX, y: initialY },
    { x: initialX - 1, y: initialY },
    { x: initialX - 2, y: initialY },
  ];
  const [segments, setSegments] = useState<Position[]>(initialSegments);
  const [direction, setDirection] = useState<Direction>("NONE");
  const [renderSegments, setRenderSegments] =
    useState<Position[]>(initialSegments);

  const previousSegments = useRef<Position[]>(initialSegments);
  const lastUpdateTime = useRef<number>(performance.now());

  const deathOfSnake = () => {
    setSegments(initialSegments);
    setRenderSegments(initialSegments);
    setDirection("NONE");
  };

  // Animating snake movements between grid cells
  useEffect(() => {
    let animationFrameId: number;
    const subCellMovementAnimation = (time: number) => {
      const delta = time - lastUpdateTime.current;
      const t = Math.min(delta / MOVE_INTERVAL, 1);
      if (
        previousSegments.current[0].x - segments[0].x > 1 ||
        previousSegments.current[0].y - segments[0].y > 1 ||
        previousSegments.current[0].x - segments[0].x < -1 ||
        previousSegments.current[0].y - segments[0].y < -1
      ) {
        return; // Skipping sub cell animation on death
      }
      const interpolated = segments.map((seg, i) => {
        const prev = previousSegments.current[i] || seg;
        return {
          x: prev.x + (seg.x - prev.x) * t,
          y: prev.y + (seg.y - prev.y) * t,
        };
      });
      setRenderSegments(interpolated);
      window.snakePosition = {
        x: interpolated[0].x * gridSize + gridSize / 2,
        y: interpolated[0].y * gridSize + gridSize / 2,
      };
      animationFrameId = requestAnimationFrame(subCellMovementAnimation);
    };
    animationFrameId = requestAnimationFrame(subCellMovementAnimation);
    return () => cancelAnimationFrame(animationFrameId);
  }, [segments]);

  // Set snake direction based on input
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

  // Move snake between grid cells based on direction
  useEffect(() => {
    const cellMovement = () => {
      setSegments((prevSegments) => {
        previousSegments.current = prevSegments;
        lastUpdateTime.current = performance.now();
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
        if (newHead.x === foodPosition.x && newHead.y === foodPosition.y) {
          resetFoodPosition();
          return [newHead, ...prevSegments];
        }
        if (
          newHead.x < 0 ||
          newHead.x >= gridWidth ||
          newHead.y < 0 ||
          newHead.y >= gridHeight
        ) {
          deathOfSnake(); // Going off limits
          return prevSegments;
        }
        const newSegments = [
          newHead,
          ...prevSegments.slice(0, prevSegments.length - 1),
        ];
        return newSegments;
      });
    };
    const gameInterval = setInterval(cellMovement, MOVE_INTERVAL);
    return () => clearInterval(gameInterval);
  }, [gridHeight, gridWidth, direction]);

  return (
    <>
      {renderSegments.map((segment, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            width: `${gridSize - 2}px`,
            height: `${gridSize - 2}px`,
            backgroundColor:
              index === 0 ? "rgba(255, 0, 0, 0.7)" : "rgba(255, 0, 0, 0.5)",
            left: `${segment.x * gridSize}px`,
            top: `${segment.y * gridSize}px`,
            pointerEvents: "auto",
            userSelect: "none",
          }}
        />
      ))}
    </>
  );
};
