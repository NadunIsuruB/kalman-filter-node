// src/chart/chart.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ChartService } from 'src/chart/chart.service';
import { KalmanFilter } from 'src/kalman-filter/src';

@Controller('chart')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Get()
  getChartSvg(@Res() res: Response): void {
    let rounds: string[] = [];
        let meas: {x:number; y:number}[] = [];
        let pred: {x:number; y:number}[] = [];
        let corr: {x:number; y:number}[] = [];

        const initialState = {
            x: 1,
            y: 2,
            vx: 1,
            vy: 1,
        };

        const kalmanFilter = new KalmanFilter(initialState);

        // mearuements with different speeds (with different vx and vy) with some noise in location
        const measurements = [
            { x: 2, y: 2, vx: 1, vy: 2 },
            { x: 3, y: 4, vx: 1, vy: 1 },
            { x: 4, y: 4, vx: 1, vy: 1 },
            { x: 5, y: 6, vx: 1, vy: 2 },
            { x: 6, y: 6, vx: 1, vy: 1 },
            { x: 7, y: 8, vx: 1, vy: 2 },
            { x: 8, y: 8, vx: 1, vy: 3 },
            { x: 10, y: 13, vx: 1, vy: 2 },
            { x: 10, y: 15, vx: 1, vy: 1 },
            { x: 13, y: 15, vx: 1, vy: 2 },
            { x: 15, y: 20, vx: 1, vy: 1 },
            { x: 15, y: 20, vx: 1, vy: 2 },
            { x: 20, y: 25, vx: 1, vy: 1 },
            { x: 20, y: 25, vx: 1, vy: 2 },
            { x: 25, y: 30, vx: 1, vy: 1 },
            { x: 25, y: 30, vx: 1, vy: 2 },
            { x: 30, y: 35, vx: 1, vy: 1 },
            { x: 30, y: 35, vx: 1, vy: 2 },
            { x: 35, y: 40, vx: 1, vy: 1 },
            { x: 35, y: 40, vx: 1, vy: 2 },
            { x: 40, y: 45, vx: 1, vy: 1 },
            { x: 40, y: 45, vx: 1, vy: 2 },
            { x: 45, y: 50, vx: 1, vy: 1 },
            { x: 45, y: 50, vx: 1, vy: 2 },
            { x: 50, y: 55, vx: 1, vy: 1 },

            /* add some noise in location */
            { x: 100, y: 105, vx: 1, vy: 2 },

            { x: 50, y: 55, vx: 1, vy: 2 },
            { x: 55, y: 60, vx: 1, vy: 1 },
            { x: 55, y: 60, vx: 1, vy: 2 },
            { x: 60, y: 65, vx: 1, vy: 1 },
            { x: 60, y: 65, vx: 1, vy: 2 },
            { x: 65, y: 70, vx: 1, vy: 1 },
            { x: 65, y: 70, vx: 1, vy: 2 },
            { x: 70, y: 75, vx: 1, vy: 1 },
            /* add some bend and go down in curve line */
            { x: 75, y: 70, vx: 1, vy: 2 },
            { x: 80, y: 65, vx: 1, vy: 1 },
            /* add inconsistant spikes and bends */
            { x: 85, y: 70, vx: 1, vy: 2 },
            { x: 90, y: 65, vx: 1, vy: 1 },
            { x: 95, y: 70, vx: 1, vy: 2 },
            { x: 100, y: 65, vx: 1, vy: 1 },
            { x: 105, y: 70, vx: 1, vy: 2 },
            { x: 110, y: 65, vx: 1, vy: 1 },
            { x: 115, y: 70, vx: 1, vy: 2 },
            { x: 120, y: 65, vx: 1, vy: 1 },
            { x: 125, y: 70, vx: 1, vy: 2 },
            { x: 130, y: 65, vx: 1, vy: 1 },
            { x: 135, y: 70, vx: 1, vy: 2 },
            { x: 140, y: 65, vx: 1, vy: 1 },
            { x: 145, y: 70, vx: 1, vy: 2 },
            { x: 150, y: 65, vx: 1, vy: 1 },
            { x: 155, y: 70, vx: 1, vy: 2 },
            { x: 160, y: 65, vx: 1, vy: 1 },
            { x: 165, y: 70, vx: 1, vy: 2 },
            { x: 170, y: 65, vx: 1, vy: 1 },
            { x: 175, y: 70, vx: 1, vy: 2 },
            { x: 180, y: 65, vx: 1, vy: 1 },
            { x: 185, y: 70, vx: 1, vy: 2 },
            { x: 190, y: 65, vx: 1, vy: 1 }

        ];

        for (let i = 0; i < measurements.length; i++) {
            rounds.push(`Round ${i + 1}`);
            meas.push({x: measurements[i].x, y: measurements[i].y});

            const dt = 3;
            kalmanFilter.predict(dt);

            const currentState = kalmanFilter.getState();
            pred.push({x: currentState.x, y: currentState.y});

            kalmanFilter.correct(measurements[i]);

            const currentState1 = kalmanFilter.getState();
            corr.push({x: currentState1.x, y: currentState1.y});
        }

    const svg = this.chartService.generateChartSvg(meas, pred, corr);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  }
}
