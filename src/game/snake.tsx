import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Position } from "./game";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT" | "NONE";

interface GameTools {
  gridSize: number;
  gridWidth: number;
  gridHeight: number;
  foodPosition: Position;
  resetFoodPosition: () => void;
  gamePausedRef: React.MutableRefObject<boolean>;
  togglePause: () => void;
}

declare global {
  interface Window {
    snakePosition: Position;
  }
}

export const Snake: React.FC<GameTools> = ({
  gridSize,
  gridWidth,
  gridHeight,
  foodPosition,
  resetFoodPosition,
  gamePausedRef,
  togglePause,
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

  useEffect(() => {
    window.snakePosition = {
      x: initialX * gridSize + gridSize / 2,
      y: initialY * gridSize + gridSize / 2,
    };
  }, []);

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
    setTimeout(() => {
      window.snakePosition = {
        x: initialX * gridSize + gridSize / 2,
        y: initialY * gridSize + gridSize / 2,
      };
      setSegments(initialSegments);
      setRenderSegments(initialSegments);
      currentDirection.current = "RIGHT";
      lastProcessedDirection.current = "RIGHT";
      isDead.current = false;
      togglePause();
    }, 300);
  };

  // Animating snake movements between grid cells
  useEffect(() => {
    let animationFrameId: number;
    if (gamePausedRef.current) return;
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

      if (isDead.current || gamePausedRef.current) return;
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
      if (isDead.current || gamePausedRef.current) return;
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
          window.snakeEatsFood();
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
  }, [gridHeight, gridWidth, gamePausedRef.current]);

  const getSegmentStyle = (
    index: number,
    segment: Position,
    segments: Position[],
  ) => {
    const isHead = index === 0;
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      width: `${gridSize - 4}px`,
      height: `${gridSize - 4}px`,
      backgroundColor: "#3e9676", // Google blue color
      borderRadius: "8px",
      left: `${segment.x * gridSize + 2}px`,
      top: `${segment.y * gridSize + 2}px`,
      pointerEvents: "auto",
      userSelect: "none",
      boxSizing: "border-box",
      zIndex: isHead ? 2 : 1,
    };

    return baseStyle;
  };

  const Eyes = ({ direction }: { direction: Direction }) => {
    const eyeSize = gridSize * 0.6;
    const pupilSize = eyeSize * 0.5;
    const pupilOffset = pupilSize * 0.4;
    const eyeOffset = gridSize * 0.45;

    const getPupilTransform = (dir: Direction) => {
      switch (dir) {
        case "UP":
          return `translate(0, -${pupilOffset}px)`;
        case "DOWN":
          return `translate(0, ${pupilOffset}px)`;
        case "LEFT":
          return `translate(-${pupilOffset}px, 0)`;
        case "RIGHT":
          return `translate(${pupilOffset}px, 0)`;
        default:
          return "translate(0, 0)";
      }
    };

    // Eye styles
    let leftEyeStyle: React.CSSProperties = {
      position: "absolute",
      width: `${eyeSize}px`,
      height: `${eyeSize}px`,
      backgroundColor: "white",
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    };

    let rightEyeStyle: React.CSSProperties = {
      ...leftEyeStyle,
    };

    switch (lastProcessedDirection.current) {
      case "UP":
        leftEyeStyle = {
          ...leftEyeStyle,
          top: "-10%",
          left: `calc(30% - ${eyeOffset}px)`,
        };
        rightEyeStyle = {
          ...rightEyeStyle,
          top: "-10%",
          right: `calc(30% - ${eyeOffset}px)`,
        };
        break;
      case "DOWN":
        leftEyeStyle = {
          ...leftEyeStyle,
          bottom: "-10%",
          left: `calc(30% - ${eyeOffset}px)`,
        };
        rightEyeStyle = {
          ...rightEyeStyle,
          bottom: "-10%",
          right: `calc(30% - ${eyeOffset}px)`,
        };
        break;
      case "LEFT":
        leftEyeStyle = {
          ...leftEyeStyle,
          top: `calc(30% - ${eyeOffset}px)`,
          left: "-10%",
        };
        rightEyeStyle = {
          ...rightEyeStyle,
          bottom: `calc(30% - ${eyeOffset}px)`,
          left: "-10%",
        };
        break;
      case "RIGHT":
        leftEyeStyle = {
          ...leftEyeStyle,
          top: `calc(30% - ${eyeOffset}px)`,
          right: "-10%",
        };
        rightEyeStyle = {
          ...rightEyeStyle,
          bottom: `calc(30% - ${eyeOffset}px)`,
          right: "-10%",
        };
        break;
    }

    const pupilStyle: React.CSSProperties = {
      width: `${pupilSize}px`,
      height: `${pupilSize}px`,
      backgroundColor: "black",
      borderRadius: "50%",
      transform: getPupilTransform(lastProcessedDirection.current),
      transition: "transform 0.1s ease-out",
    };

    const deadEyeCrossStyle: React.CSSProperties = {
      position: "relative",
      width: `${pupilSize}px`,
      height: `${pupilSize}px`,
    };

    const crossLineStyle: React.CSSProperties = {
      position: "absolute",
      width: "100%",
      height: "4px",
      backgroundColor: "black",
      top: "50%",
      left: "0",
      transformOrigin: "center",
    };

    const DeadEye = () => (
      <div style={deadEyeCrossStyle}>
        <span style={{ ...crossLineStyle, transform: "rotate(45deg)" }} />
        <span style={{ ...crossLineStyle, transform: "rotate(-45deg)" }} />
      </div>
    );

    const Eye = ({ style }: { style: React.CSSProperties }) => (
      <div style={style}>
        {isDead.current ? <DeadEye /> : <div style={pupilStyle} />}
      </div>
    );

    return (
      <>
        <Eye style={leftEyeStyle} />
        <Eye style={rightEyeStyle} />
      </>
    );
  };

  return (
    <>
      {/* Snake Segments */}
      {renderSegments.map((segment, index) => (
        <div
          key={index}
          style={getSegmentStyle(index, segment, renderSegments)}
        >
          {index === 0 && <Eyes direction={lastProcessedDirection.current} />}
        </div>
      ))}
    </>
  );
};
