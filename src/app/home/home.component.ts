import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CoordsService } from 'src/services/coords.service';
import { Fill } from 'src/class/fill';
import { Paint, Tools } from 'src/class/paint';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('canvas', {static: true}) canvas: ElementRef<HTMLCanvasElement>;
  startPos
  currentPos
  context: CanvasRenderingContext2D 
  savedData

  paintConfig: Paint = new Paint()

  undoStack = [];
  undoLimit = 3;

  constructor(private coordsService: CoordsService) { }

  ngOnInit(): void {
    this.canvas.nativeElement.onmousedown = e => this.onMouseDown(e)
    this.context = this.canvas.nativeElement.getContext("2d")
    this.context.lineCap = 'round';
  
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

  definirEspessura(i) {
    this.paintConfig.lineWidth = i
  }

  onMouseDown(e: MouseEvent): void {
    this.savedData = this.context.getImageData(0, 0, this.canvas.nativeElement.clientWidth, this.canvas.nativeElement.clientHeight)

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
      this.context.lineWidth = this.paintConfig.lineWidth;
      this.context.lineTo(this.currentPos.x, this.currentPos.y);
      this.context.strokeStyle = this.paintConfig.selectedColor;
      this.context.stroke();
  }

  setColor(color) {
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

  clear() {
    //clear
  }
}
