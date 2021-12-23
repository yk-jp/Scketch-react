import React, { useRef, useEffect, useState } from "react";

// css
import "./style.css";

const Draw = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingData = useRef<CanvasRenderingContext2D | null>(null);
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);

  const [lineColor, setLineColor] = useState<string>("#000000"); //Default color is black

  useEffect(() => {
    const resizeCanvas = async () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth / 2;
      canvasRef.current.height = window.innerHeight / 2;
    };
    const initializeCanvas = async () => {
      const canvas: HTMLCanvasElement = canvasRef.current as HTMLCanvasElement;
      resizeCanvas(); //get canvas size

      const ctx: CanvasRenderingContext2D = canvas.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
      if (sessionStorage.getItem("lineColor")) {
        ctx.strokeStyle = sessionStorage.getItem("lineColor") as string;
        setLineColor(sessionStorage.getItem("lineColor") as string);
      }

      drawingData.current = ctx as CanvasRenderingContext2D;
    };

    initializeCanvas();

    window.addEventListener("resize", () => {
      initializeCanvas();
    });

    return () => {
      // clean up
      window.removeEventListener("resize", () => {
        initializeCanvas();
      });
    };
  }, []);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingData.current) return;

    const baseCoordinateX: number = canvasRef.current?.getBoundingClientRect()
      .left as number;
    const baseCoordinateY: number = canvasRef.current?.getBoundingClientRect()
      .top as number;
    const coordinateX: number = e.clientX;
    const coordinateY: number = e.clientY;
    // start drawing
    drawingData.current.beginPath();
    drawingData.current.moveTo(
      coordinateX - baseCoordinateX,
      coordinateY - baseCoordinateY
    );
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

  const changeLineColor = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!drawingData.current) return;
    setLineColor(e.target.value);
    // store data in session storage
    sessionStorage.setItem('lineColor',e.target.value);
    drawingData.current.strokeStyle = e.target.value as string;
  };

  return (
    <div id="drawContainer">
      <div className="h-100 d-flex justify-content-center align-items-center flex-column">
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

        <section id="ToolsForDrawing" className="mt-2">
          <div id="lineColor">
            <span>Change color for line</span>
            <input
              type="color"
              className="colorPicker"
              value={lineColor}
              onChange={(e) => {
                changeLineColor(e);
              }}
            />
          </div>
          <div id="lineWeight">
            <span>Change weight for line</span>
            <select>
              <option value="volvo">Volvo</option>
              <option value="saab">Saab</option>
              <option value="mercedes">Mercedes</option>
              <option value="audi">Audi</option>
            </select>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Draw;
