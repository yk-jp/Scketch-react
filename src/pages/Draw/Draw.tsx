import React, { useRef, useEffect, useState } from "react";
// css
import "./style.css";

// module
import { jsPDF } from "jspdf";
import { v4 as uuidv4 } from "uuid";
// custom module
import DoublyLinkedList, { Node } from "../../utils/DoublyLinkedList";

const Draw = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasParentRef = useRef<HTMLDivElement | null>(null);
  const drawingData = useRef<CanvasRenderingContext2D | null>(null);
  const drawingHistory = useRef<DoublyLinkedList<ImageData>>(
    new DoublyLinkedList()
  );
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);

  const [lineColor, setLineColor] = useState<string>("#000000"); //Default color is black
  const [lineWeight, setLineWeight] = useState<number>(1.0); //Default color is 1.0

  useEffect(() => {
    const initializeCanvas = async () => {
      const canvas: HTMLCanvasElement = canvasRef.current as HTMLCanvasElement;
      // size
      canvas.width = canvasParentRef.current.clientWidth;
      canvas.height = canvasParentRef.current.clientHeight;

      const ctx: CanvasRenderingContext2D = canvas.getContext(
        "2d"
      ) as CanvasRenderingContext2D;

      drawingData.current = ctx as CanvasRenderingContext2D;

      // initialize drawing history
      storeDrawingHistory();
    };

    initializeCanvas();
  }, []);

  const returnBaseCoordinate = (): { [key: string]: number } => {
    const baseCoordinateX: number = canvasRef.current?.getBoundingClientRect()
      .left as number;
    const baseCoordinateY: number = canvasRef.current?.getBoundingClientRect()
      .top as number;
    return { baseCoordinateX, baseCoordinateY };
  };

  const isOutOfCanvas = (x: number, y: number): boolean => {
    const { baseCoordinateX, baseCoordinateY } = returnBaseCoordinate();

    if (x < baseCoordinateX || x > baseCoordinateX + canvasRef.current.width)
      return true;
    if (y < baseCoordinateY || y > baseCoordinateY + canvasRef.current.height)
      return true;

    return false;
  };

  const getImageString = () => {
    return drawingData.current.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
  };

  const storeDrawingHistory = () => {
    // store data to linked list for undoing and redoing.
    const imgData: ImageData = getImageString();
    drawingHistory.current.insertAtTheBeginning(imgData);
  };

  const updateDrawing = (dataURI: string) => {
    if (!drawingData.current) return;
    const tempDataForDrawing: CanvasImageSource = new Image();
    tempDataForDrawing.src = dataURI;
    drawingData.current.drawImage(tempDataForDrawing, 0, 0);
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingData.current) return;
    const { baseCoordinateX, baseCoordinateY } = returnBaseCoordinate();
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
    if (!drawingData.current || !canvasRef.current || !isPointerDown) return;
    drawingData.current.closePath();

    setIsPointerDown(false);

    // store data to session storage
    const dataURI: string = canvasRef.current.toDataURL();
    updateDrawing(dataURI);

    // store data to linked list for undoing and redoing.
    storeDrawingHistory();
  };


  const drawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDown || !drawingData.current) return;
    const { baseCoordinateX, baseCoordinateY } = returnBaseCoordinate();
    const coordinateX: number = e.clientX;
    const coordinateY: number = e.clientY;

    drawingData.current.lineTo(
      coordinateX - baseCoordinateX,
      coordinateY - baseCoordinateY
    );

    drawingData.current.stroke();

    if (isOutOfCanvas(coordinateX, coordinateY)) {
      endDrawing();
    }
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
    drawingData.current.strokeStyle = "#FFFFFF";
  };

  const changePencil = () => {
    if (!drawingData.current || !canvasRef.current) return;
    drawingData.current.strokeStyle = lineColor;
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

  const undo = () => {
    drawingHistory.current.moveToNextNode();
    const prevDrawings: Node<ImageData> = drawingHistory.current.getHead();
    drawingData.current.putImageData(prevDrawings.getData(), 0, 0);

  };

  const redo = () => {
    drawingHistory.current.goBackToPrevNode();
    const drawingsAheadOFcurrent: Node<ImageData> =
      drawingHistory.current.getHead();
    drawingData.current.putImageData(drawingsAheadOFcurrent.getData(), 0, 0);

  };

  return (
    <div id="drawContainer">
      <div className="h-100">
        <div
          id="canvasSec"
          ref={canvasParentRef}
          className=" px-5 mt-3 w-90 h-75 d-flex justify-content-center m-auto"
        >
          <canvas
            id="drawingArea"
            ref={canvasRef}
            style={{ border: "1px solid black" }}
            className="canvasScrollNone"
            onPointerOver={() => endDrawing()}
            onPointerDown={(e) => startDrawing(e)}
            onPointerMove={(e) => drawing(e)}
            onPointerUp = {() => endDrawing()}

          ></canvas>
        </div>

        <div
          id="ToolsForDrawing"
          className="mt-2 w-100 d-flex justify-content-center"
        >

          <div id="lineColor">
            <input
              type="color"
              className="lineColor"
              value={lineColor}
              onChange={(e) => {
                changeLineColor(e);
              }}
            />
          </div>
          <div id="lineWeight">
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
          <div className="d-flex">
            <div id="pencil">
              <button onClick={() => changePencil()}>pencil</button>
            </div>
            <div id="eraser">
              <button onClick={() => changeEraser()}>eraser</button>
            </div>
          </div>
         
          <div id="undo_redo" className="d-flex mx-1">
            <div id="undo" className="mx-1">
              <button id="" onClick={() => undo()}>
                undo
              </button>
            </div>
            <div id="redo" className="mx-1">
              <button id="redo" onClick={() => redo()}>
                redo
              </button>
            </div>
            <div id="clearCanvas">
              <button onClick={() => clearDrawing()}>clear</button>
            </div>
          </div>
          <div id="generatePDF">
            <button onClick={() => downloadPDF()}>download pdf</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Draw;
