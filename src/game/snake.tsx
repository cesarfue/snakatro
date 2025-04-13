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
  const MOVE_INTERVAL = 80;
  const initialX = Math.floor(gridWidth / 2);
  const initialY = Math.floor(gridHeight / 2);

  const initialSegments = [
    { x: initialX, y: initialY },
    { x: initialX - 1, y: initialY },
    { x: initialX - 2, y: initialY },
  ];
  const [segments, setSegments] = useState<Position[]>(initialSegments);
  const [renderSegments, setRenderSegments] =
    useState<Position[]>(initialSegments);

  const previousSegments = useRef<Position[]>(initialSegments);
  const lastUpdateTime = useRef<number>(performance.now());
  const currentDirection = useRef<Direction>("RIGHT");
  const lastProcessedDirection = useRef<Direction>("RIGHT");
  const foodRef = useRef<Position>(foodPosition);
  const shouldResetFood = useRef<boolean>(false);
  const isDead = useRef<boolean>(false);

  // Keep the food reference updated
  useEffect(() => {
    foodRef.current = foodPosition;
  }, [foodPosition]);

  // Handle food reset in a separate effect
  useEffect(() => {
    if (shouldResetFood.current) {
      resetFoodPosition();
      shouldResetFood.current = false;
    }
  }, [resetFoodPosition, segments]);

  const deathOfSnake = () => {
    isDead.current = true;

    switch (lastProcessedDirection.current) {
      case "UP":
        currentDirection.current = "DOWN";
        break;
      case "DOWN":
        currentDirection.current = "UP";
        break;
      case "LEFT":
        currentDirection.current = "RIGHT";
        break;
      case "RIGHT":
        currentDirection.current = "LEFT";
        break;
    }
    setTimeout(() => {
      setSegments(initialSegments);
      setRenderSegments(initialSegments);
      currentDirection.current = "RIGHT";
      lastProcessedDirection.current = "RIGHT";
      isDead.current = false;
    }, 300);
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
  }, [segments, gridSize]);

  // Set snake direction based on input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const lastDir = lastProcessedDirection.current;

      if (isDead.current) return;
      switch (event.key) {
        case "ArrowUp":
          if (lastDir !== "DOWN") {
            currentDirection.current = "UP";
          }
          break;
        case "ArrowDown":
          if (lastDir !== "UP") {
            currentDirection.current = "DOWN";
          }
          break;
        case "ArrowLeft":
          if (lastDir !== "RIGHT") {
            currentDirection.current = "LEFT";
          }
          break;
        case "ArrowRight":
          if (lastDir !== "LEFT") {
            currentDirection.current = "RIGHT";
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Move snake between grid cells based on direction
  useEffect(() => {
    const cellMovement = () => {
      // Update the last processed direction
      if (isDead.current) return;
      lastProcessedDirection.current = currentDirection.current;
      setSegments((prevSegments) => {
        previousSegments.current = prevSegments;
        lastUpdateTime.current = performance.now();
        const head = prevSegments[0];
        let newHead: Position;

        switch (currentDirection.current) {
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

        if (
          newHead.x === foodRef.current.x &&
          newHead.y === foodRef.current.y
        ) {
          shouldResetFood.current = true;
          return [newHead, ...prevSegments]; // Grow the snake
        }

        if (
          newHead.x < 0 ||
          newHead.x >= gridWidth ||
          newHead.y < 0 ||
          newHead.y >= gridHeight
        ) {
          deathOfSnake(); // Going off limits
          return initialSegments;
        }

        if (
          prevSegments.some(
            (segment) => segment.x === newHead.x && segment.y === newHead.y,
          )
        ) {
          deathOfSnake(); // Hit itself
          return initialSegments;
        }

        // Normal movement (no growth)
        const newSegments = [
          newHead,
          ...prevSegments.slice(0, prevSegments.length - 1),
        ];
        return newSegments;
      });
    };

    const gameInterval = setInterval(cellMovement, MOVE_INTERVAL);
    return () => clearInterval(gameInterval);
  }, [gridHeight, gridWidth]);

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
