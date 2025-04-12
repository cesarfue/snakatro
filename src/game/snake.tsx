import * as React from "react";
import { useState, useEffect, useRef } from "react";

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
  const [renderSegments, setRenderSegments] =
    useState<Position[]>(initialSegments);

  const previousSegments = useRef<Position[]>(initialSegments);
  const lastUpdateTime = useRef<number>(performance.now());

  useEffect(() => {
    let animationFrameId: number;

    const animate = (time: number) => {
      const delta = time - lastUpdateTime.current;
      const t = Math.min(delta / MOVE_INTERVAL, 1); // progress between 0 and 1

      const interpolated = segments.map((seg, i) => {
        const prev = previousSegments.current[i] || seg;
        return {
          x: prev.x + (seg.x - prev.x) * t,
          y: prev.y + (seg.y - prev.y) * t,
        };
      });

      setRenderSegments(interpolated);
      window.snakePosition = {
        x: interpolated[0].x * GRID_SIZE + GRID_SIZE / 2,
        y: interpolated[0].y * GRID_SIZE + GRID_SIZE / 2,
      };
      console.log(window.snakePosition);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [segments]);

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

        if (
          newHead.x < 0 ||
          newHead.x >= GRID_WIDTH ||
          newHead.y < 0 ||
          newHead.y >= GRID_HEIGHT
        )
          return prevSegments;

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
      {renderSegments.map((segment, index) => (
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
            userSelect: "none",
            //transition: "top 150ms linear, left 150ms linear",
          }}
        />
      ))}
    </>
  );
};
