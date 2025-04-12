import * as React from "react";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    snakePosition: { x: number; y: number };
  }
}

window.snakePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

export const Snake: React.FC = () => {
  const [position, setPosition] = useState(window.snakePosition);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const speed = 200;

  const directionRef = React.useRef(direction);
  const positionRef = React.useRef(position);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      switch (event.key) {
        case "ArrowUp":
          setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          setDirection({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    let lastTime = performance.now();

    const tick = (now: number) => {
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      const dir = directionRef.current;
      if (dir.x !== 0 || dir.y !== 0) {
        setPosition((prev) => {
          let newX = prev.x + dir.x * speed * deltaTime;
          let newY = prev.y + dir.y * speed * deltaTime;

          newX = Math.min(Math.max(newX, 25), window.innerWidth - 25);
          newY = Math.min(Math.max(newY, 25), window.innerHeight - 25);

          const newPos = { x: newX, y: newY };
          window.snakePosition = newPos;
          return newPos;
        });
      }
      requestAnimationFrame(tick);
    };

    const animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [speed]);

  return (
    <div
      style={{
        position: "absolute",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        backgroundColor: "rgba(255, 0, 0, 0.7)",
        left: `${position.x - 10}px`,
        top: `${position.y - 10}px`,
        pointerEvents: "auto",
        transition: "none",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        userSelect: "none",
      }}
    />
  );
};
