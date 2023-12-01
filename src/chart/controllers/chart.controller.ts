// src/chart/chart.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ChartService } from 'src/chart/chart.service';
import { KalmanFilter } from 'src/kalman-filter/src';
import { util } from 'src/kalman-filter/src/util';
import * as fs from 'fs';

@Controller('chart')
export class ChartController {
  constructor(private readonly chartService: ChartService) { }

  @Get()
  getChartSvg(@Res() res: Response): void {
    let rounds: string[] = [];
    let meas: { x: number; y: number }[] = [];
    let pred: { x: number; y: number }[] = [];
    let corr: { x: number; y: number }[] = [];

    const initialState = {
      x: 80.40765333333334,
      y: 8.06221,
      vx: 0,
      vy: 0
    };

    const kalmanFilter = new KalmanFilter(initialState);

    // measurements format: {x: 2, y: 2, vx: 1, vy: 2},

    const data = fs.readFileSync('./haulmatic.gpsinfo2_trip_full.json', 'utf8')
    const jsonData = JSON.parse(data)

    for (let i = 0; i < jsonData.length; i++) {
      const measure = util.convertObject(jsonData[i]);
      rounds.push(`Round ${i + 1}`);
      meas.push({ x: measure.x, y: measure.y });

      const dt = 10;
      kalmanFilter.predict(dt);

      const currentState = kalmanFilter.getState();
      pred.push({ x: currentState.x, y: currentState.y });

      kalmanFilter.correct(measure);

      const currentState1 = kalmanFilter.getState();
      corr.push({ x: currentState1.x, y: currentState1.y });
    }
    res.send({
      'predictions': pred,
      'corrections': corr,
      'measurements': meas,
    });
  }
}
