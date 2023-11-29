import { Injectable } from '@nestjs/common';

@Injectable()
export class ChartService {
  generateChartSvg(
    measurements: { x: number; y: number }[],
    predictions: { x: number; y: number }[],
    corrections: { x: number; y: number }[],
  ): string {
    let svg = `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">`;

    // Draw the axis
    svg += `<line x1="0" y1="400" x2="800" y2="400" stroke="black" />`;
    svg += `<line x1="0" y1="0" x2="0" y2="400" stroke="black" />`;

    // Draw the lines with labels
    svg += this.generateLabeledLine(measurements, 'Measurements', 'blue');
    svg += this.generateLabeledLine(predictions, 'Predictions', 'green');
    svg += this.generateLabeledLine(corrections, 'Corrections', 'red');

    svg += '</svg>';

    return svg;
  }

  private generateLabeledLine(coordinates: { x: number; y: number }[], label: string, color: string): string {
    let line = `<polyline fill="none" stroke="${color}" stroke-width="2" points="`;

    coordinates.forEach((coord, index) => {
      const x = (index * 800) / (coordinates.length - 1);
      const y = 400 - (coord.y * 400) / Math.max(...coordinates.map(c => c.y), 1);

      line += `${x},${y} `;
    });

    line += `" />`;

    // Add label text
    const lastCoord = coordinates[coordinates.length - 1];
    const labelX = (lastCoord.x * 800) / (coordinates.length - 1) + 5;
    const labelY = 400 - (lastCoord.y * 400) / Math.max(...coordinates.map(c => c.y), 1) - 5;

    line += `<text x="${labelX}" y="${labelY}" fill="${color}">${label}</text>`;

    return line;
  }
}
