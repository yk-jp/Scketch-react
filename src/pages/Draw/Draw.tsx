import React, { useRef, useEffect, useState } from "react";

// css
import "./style.css";

const Draw = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingData = useRef<CanvasRenderingContext2D | null>(null);
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);

  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const resizeCanvas = async () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth / 2;
      canvasRef.current.height = window.innerHeight / 2;
    };
    const initializeCanvas = async () => {
      const canvas: HTMLCanvasElement = canvasRef.current as HTMLCanvasElement;
      resizeCanvas(); //get canvas size
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      const ctx: CanvasRenderingContext2D = canvas.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
      drawingData.current = ctx as CanvasRenderingContext2D;
    };

    initializeCanvas();
    window.addEventListener("resize", () => {
      resizeCanvas();
    });

    return () => {
      // clean up
      window.removeEventListener("resize", () => {
        resizeCanvas();
      });
    };
  }, []);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingData.current) return;
    console.log(windowSize);
    const baseCoordinateX: number = canvasRef.current?.getBoundingClientRect()
      .left as number;
    const baseCoordinateY: number = canvasRef.current?.getBoundingClientRect()
      .top as number;
    const coordinateX: number = e.screenX;
    const coordinateY: number = e.clientY;
    // start drawing
    drawingData.current.beginPath();
    drawingData.current.moveTo(
      coordinateX - baseCoordinateX,
      coordinateY - baseCoordinateY
    );
    console.table({
      baseCoordinateX,
      coordinateX,
      baseCoordinateY,
      coordinateY,
    });
    setIsPointerDown(true);
  };

  const endDrawing = () => {
    if (!drawingData.current) return;

    drawingData.current.closePath();
    setIsPointerDown(false);
  };

  const drawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDown || !drawingData.current) return;
    const baseCoordinateX: number = canvasRef.current?.getBoundingClientRect()
      .left as number;
    const baseCoordinateY: number = canvasRef.current?.getBoundingClientRect()
      .top as number;
    const coordinateX: number = e.clientX;
    const coordinateY: number = e.clientY;
    drawingData.current.lineTo(
      coordinateX - baseCoordinateX,
      coordinateY - baseCoordinateY
    );
    drawingData.current.stroke();
  };

  return (
    <div id="drawContainer">
      <div className="h-100 d-flex justify-content-center align-items-center">
        <main id="canvasSec">
          <canvas
            id="drawingArea"
            ref={canvasRef}
            style={{ border: "1px solid black" }}
            onPointerDown={(e) => startDrawing(e)}
            onPointerUp={() => endDrawing()}
            onPointerMove={(e) => drawing(e)}
          ></canvas>
        </main>
      </div>
    </div>
  );
};

export default Draw;
