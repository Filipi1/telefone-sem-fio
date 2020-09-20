import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CoordsService } from 'src/services/coords.service';
import { Fill } from 'src/class/fill';
import { Paint, Tools } from 'src/class/paint';
import Point from 'src/class/point';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    if (event.keyCode == 26 && event.ctrlKey)
      this.undoPaint()
  }
  
  @ViewChild('canvas', {static: true}) canvas: ElementRef<HTMLCanvasElement>;
  context: CanvasRenderingContext2D 

  startPos: Point
  currentPos: Point
  savedData: ImageData
  paintConfig: Paint = new Paint()
  undoStack: ImageData[] = [];
  undoLimit: Number = 10;

  constructor(private coordsService: CoordsService) { }

  ngOnInit(): void {
    this.canvas.nativeElement.onmousedown = e => this.onMouseDown(e)
    this.context = this.canvas.nativeElement.getContext("2d")
    this.context.lineCap = 'round';
    this.context.fillStyle = "#FFF"
    this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height)
  }

  setDrawFactor(event) {
    switch(event) {
      case "Pencil":
        this.paintConfig.activeTool = Tools.TOOL_PENCIL
        break;
      case "Line":
        this.paintConfig.activeTool = Tools.TOOL_LINE
        break;
      case "Circle":
        this.paintConfig.activeTool = Tools.TOOL_CIRCLE
        break;
      case "Square":
        this.paintConfig.activeTool = Tools.TOOL_SQUARE
        break;
      case "Eraser":
        this.paintConfig.activeTool = Tools.TOOL_ERASER
        break;
      case "Tintall":
        this.paintConfig.activeTool = Tools.TOOL_TINT_ALL
        break;
    }
  }

  onMouseDown(e: MouseEvent): void {
    this.savedData = this.context.getImageData(0, 0, this.canvas.nativeElement.clientWidth, this.canvas.nativeElement.clientHeight)

    if (this.undoStack.length >= this.undoLimit)
      this.undoStack.shift();

    this.undoStack.push(this.savedData);

    this.canvas.nativeElement.onmousemove = e => this.onMouseMove(e)
    document.onmouseup = e => this.onMouseUp(e);
    
    this.startPos = this.coordsService.getMouseCoordsOnCanvas(e, this.canvas.nativeElement);

    if (this.paintConfig.activeTool == Tools.TOOL_PENCIL) {
      this.context.beginPath()
      this.context.moveTo(this.startPos.x, this.startPos.y)
    } else if (this.paintConfig.activeTool == Tools.TOOL_ERASER) {
      this.context.clearRect(this.startPos.x, this.startPos.y, this.paintConfig.lineWidth, this.paintConfig.lineWidth)
    } else if (this.paintConfig.activeTool == Tools.TOOL_TINT_ALL) {
      new Fill(this.canvas.nativeElement, this.startPos, this.paintConfig.selectedColor)
    }
  }


  onMouseMove(e: MouseEvent): void {
    this.currentPos = this.coordsService.getMouseCoordsOnCanvas(e, this.canvas.nativeElement)

    switch(this.paintConfig.activeTool) {
      case Tools.TOOL_CIRCLE:
      case Tools.TOOL_LINE:
      case Tools.TOOL_SQUARE:
      case Tools.TOOL_TRIANGLE:
        this.drawShape();
        break;
      case Tools.TOOL_PENCIL:
        this.drawFreeLine();
        break;
      case Tools.TOOL_ERASER:
        this.context.clearRect(this.currentPos.x, this.currentPos.y, this.paintConfig.lineWidth, this.paintConfig.lineWidth)
        break;
      default:
        break;
    }
  }

  onMouseUp(e: MouseEvent): void {
    this.canvas.nativeElement.onmousemove = null;
    document.onmouseup = null
  }

  lineWeight(weight: number) {
    this.context.lineCap = 'round';
    this.paintConfig.lineWidth = weight
  }

  undoPaint() {
    if (this.undoStack.length > 0) {
      this.context.putImageData(this.undoStack[this.undoStack.length - 1], 0, 0);
      this.undoStack.pop();
    } else {
      alert("Nenhum desfazer disponivel")
    }
  }

  drawShape() {
    this.context.putImageData(this.savedData, 0, 0);
    this.context.beginPath();
    this.context.strokeStyle = this.paintConfig.selectedColor;
    this.context.lineWidth = this.paintConfig.lineWidth;

    switch(this.paintConfig.activeTool) {
      case Tools.TOOL_LINE:
        this.context.moveTo(this.startPos.x, this.startPos.y);
        this.context.lineTo(this.currentPos.x, this.currentPos.y);
        break;
      case Tools.TOOL_SQUARE:
        this.context.rect(this.startPos.x, this.startPos.y, this.currentPos.x - this.startPos.x, this.currentPos.y - this.startPos.y);
        break;
      case Tools.TOOL_CIRCLE:
        const distance = this.coordsService.findDistance(this.startPos, this.currentPos);
        this.context.arc(this.startPos.x, this.startPos.y, distance, 0, 2 * Math.PI, false);
        break;
      case Tools.TOOL_TRIANGLE:
        this.context.moveTo(this.startPos.x + (this.currentPos.x - this.startPos.x) / 2, this.startPos.y);
        this.context.lineTo(this.startPos.x, this.currentPos.y);
        this.context.lineTo(this.currentPos.x, this.currentPos.y);
        this.context.closePath();
      default:
        
        break;
    }

    this.context.stroke();
  }

  drawFreeLine() {
      this.context.lineCap = "round";
      this.context.lineJoin = this.context.lineCap = 'round';
      this.context.lineWidth = this.paintConfig.lineWidth;
      this.context.lineTo(this.currentPos.x, this.currentPos.y);
      this.context.strokeStyle = this.paintConfig.selectedColor;
      this.context.stroke();
  }

  setLineColor(color) {
    switch(color) {
      case "Yellow":
        this.paintConfig.selectedColor = "#ffd000"
        break;
      case "Purple":
        this.paintConfig.selectedColor = "#9f4be4"
        break;
      default:
        this.paintConfig.selectedColor = "#a6a6a6"
    }
  }

  saveImageDraw() {
    const image = this.canvas.nativeElement.toDataURL("image/png", 1.0)
      .replace("image/png", "image/octet-stream")
    
    var link = document.createElement("a")
    link.download = "image.png"
    link.href = image;
    link.click();
  }

  clearDraw() {
    this.savedData = this.context.getImageData(0, 0, this.canvas.nativeElement.clientWidth, this.canvas.nativeElement.clientHeight)
    if (this.undoStack.length >= this.undoLimit)
      this.undoStack.shift();

    this.undoStack.push(this.savedData);

    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
    this.context.fillStyle = "#FFF"
    this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height)
  }
}
