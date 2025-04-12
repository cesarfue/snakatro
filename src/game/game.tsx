import * as React from "react";
import { createRoot } from "react-dom/client";
import { Snake } from "./snake";

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
