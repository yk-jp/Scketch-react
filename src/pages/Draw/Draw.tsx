import React, { useRef, useEffect, useState } from "react";
// css
import "./style.css";
// module
import { jsPDF } from "jspdf";
import { v4 as uuidv4 } from "uuid";

const Draw = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingData = useRef<CanvasRenderingContext2D | null>(null);
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);

  const [lineColor, setLineColor] = useState<string>("#000000"); //Default color is black
  const [lineWeight, setLineWeight] = useState<number>(1.0); //Default color is 1.0

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

  const updateDrawing = (dataURI: string) => {
    if (!drawingData.current) return;
    const tempDataForDrawing: CanvasImageSource = new Image();
    tempDataForDrawing.src = dataURI;
    drawingData.current.drawImage(tempDataForDrawing, 0, 0);
  };

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
    if (!drawingData.current || !canvasRef.current) return;

    drawingData.current.closePath();
    setIsPointerDown(false);

    // store data to session storage
    const dataURI: string = canvasRef.current.toDataURL();
    updateDrawing(dataURI);
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

  const changeLineColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!drawingData.current || !canvasRef.current) return;
    const newLineColor: string = e.target.value;
    setLineColor(newLineColor);
    // store data in session storage
    drawingData.current.strokeStyle = newLineColor;
  };

  const changeLineWeight = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!drawingData.current || !canvasRef.current) return;
   
    const lineWeight: number = parseInt(e.target.value);
    setLineWeight(lineWeight);
    drawingData.current.lineWidth = lineWeight;
  };

  const clearDrawing = () => {
    if (!drawingData.current || !canvasRef.current) return;
    drawingData.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
  };

  const changeEraser = () => {
    if (!drawingData.current || !canvasRef.current) return;
    drawingData.current.globalCompositeOperation = "destination-out";
  };
  const changePencil = () => {
    if (!drawingData.current || !canvasRef.current) return;
    drawingData.current.globalCompositeOperation = "source-over";
  };

  const downloadPDF = () => {
    if (!drawingData.current || !canvasRef.current) return;
    const dataURI: string = canvasRef.current.toDataURL();
    const doc = new jsPDF("l", "px", [
      canvasRef.current.width,
      canvasRef.current.height,
    ]);

    doc.addImage(
      dataURI,
      "JPEG",
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    doc.save(`${uuidv4()}.pdf`);
  };

  return (
    <div id="drawContainer">
      <div className="h-100 d-flex justify-content-center align-items-center flex-column">
        <main id="canvasSec">
          <canvas
            id="drawingArea"
            ref={canvasRef}
            style={{ border: "1px solid black" }}
            className="canvasScrollNone"
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
          <div id="pencil">
            <button onClick={() => changePencil()}>pencil</button>
          </div>
          <div id="eraser">
            <button onClick={() => changeEraser()}>eraser</button>
          </div>
          <div id="lineWeight">
            <span>Change weight for line</span>
            <input
              type="range"
              value={lineWeight}
              className="lineWeightPicker"
              onChange={(e) => {
                changeLineWeight(e);
              }}
              min="1"
              max="15"
            />
          </div>
          <div id="clearCanvas">
            <button onClick={() => clearDrawing()}>clear</button>
          </div>
          <div id="generatePDF">
            <button onClick={() => downloadPDF()}>download pdf</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Draw;
