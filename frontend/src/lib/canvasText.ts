export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function wrapParagraphs(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split("\n");
  const allLines: string[] = [];
  paragraphs.forEach((paragraph) => {
    if (paragraph.trim().length === 0) {
      allLines.push("");
    } else {
      allLines.push(...wrapText(ctx, paragraph, maxWidth));
    }
  });
  return allLines;
}