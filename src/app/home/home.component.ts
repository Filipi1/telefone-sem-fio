import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CoordsService } from 'src/services/coords.service';

export enum Tools {
  TOOL_LINE,
  TOOL_CIRCLE,
  TOOL_SQUARE,
  TOOL_TRIANGLE,
  TOOL_PENCIL,
  TOOL_TINT_ALL,
  TOOL_BRUSH,
  TOOL_ERASER
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('canvas', {static: true}) canvas: ElementRef<HTMLCanvasElement>;
  startPos
  currentPos
  tool: Tools = Tools.TOOL_PENCIL
  context
  savedData

  expessura = 2

  constructor(private coordsService: CoordsService) { }

  ngOnInit(): void {
    this.canvas.nativeElement.onmousedown = e => this.onMouseDown(e)
    this.context = this.canvas.nativeElement.getContext("2d")
  }

  setDrawFactor(event) {
    switch(event) {
      case "Pencil":
        this.tool = Tools.TOOL_PENCIL
        break;
      case "Line":
        this.tool = Tools.TOOL_LINE
        break;
      case "Circle":
        this.tool = Tools.TOOL_CIRCLE
        break;
      case "Square":
        this.tool = Tools.TOOL_SQUARE
        break;
      case "Eraser":
        this.tool = Tools.TOOL_ERASER
        break;
    }
  }

  definirEspessura(i) {
    this.expessura = i
  }

  onMouseDown(e: MouseEvent): void {
    this.savedData = this.context.getImageData(0, 0, this.canvas.nativeElement.clientWidth, this.canvas.nativeElement.clientHeight)

    this.canvas.nativeElement.onmousemove = e => this.onMouseMove(e)
    document.onmouseup = e => this.onMouseUp(e);
    
    this.startPos = this.coordsService.getMouseCoordsOnCanvas(e, this.canvas.nativeElement);

    if (this.tool == Tools.TOOL_PENCIL) {
      this.context.beginPath()
      this.context.moveTo(this.startPos.x, this.startPos.y)
    } else if (this.tool == Tools.TOOL_ERASER) {
      this.context.clearRect(this.startPos.x, this.startPos.y, this.expessura, this.expessura)
    }
  }

  onMouseMove(e: MouseEvent): void {
    this.currentPos = this.coordsService.getMouseCoordsOnCanvas(e, this.canvas.nativeElement)
    switch(this.tool) {
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
        this.context.clearRect(this.currentPos.x, this.currentPos.y, this.expessura, this.expessura)
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
    this.context.lineWidth = this.expessura;

    switch(this.tool) {
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
      this.context.lineWidth = this.expessura;
      this.context.lineCap = 'round';
      this.context.lineTo(this.currentPos.x, this.currentPos.y);
      this.context.stroke();
  }
}
