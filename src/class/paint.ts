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

export class Paint {
    activeTool: Tools = Tools.TOOL_PENCIL
    lineWidth: number = 5
    brushSize: number
    selectedColor: string = "#a6a6a6"
    selectedTool: string
}
