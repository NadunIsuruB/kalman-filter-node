/* eslint-disable @typescript-eslint/no-unused-vars */

import { util } from "./util";

export class KalmanFilter {
  private x: number;
  private y: number;
  private vx: number;
  private vy: number;

  private dt: number = 0.1;

  private ax: number = 0;
  private ay: number = 0;


  private X: number[][]; // state matrix
  private P: number[][]; // state covariance matrix
  private Q: number[][] = [
    [0.5, 0, 0, 0],
    [0, 0.5, 0, 0],
    [0, 0, 0.5, 0],
    [0, 0, 0, 0.5],
  ] // process noise covariance matrix
  private R: number[][] = [
    [0.5, 0, 0, 0],
    [0, 0.5, 0, 0],
    [0, 0, 0.5, 0],
    [0, 0, 0, 0.5],
  ]; // measurement noise covariance matrix

  private K: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]; // Kalman gain

  private sum_x: number = 0;
  private sum_y: number = 0;
  private sum_vx: number = 0;
  private sum_vy: number = 0;
  private measurement_count: number = 0;
  private sum_x_diff: number = 0;
  private sum_y_diff: number = 0;
  private sum_vx_diff: number = 0;
  private sum_vy_diff: number = 0;

  private sum_x_vx: number = 0;
  private sum_y_vy: number = 0;

  private veri_x: number = 0;
  private veri_y: number = 0;
  private veri_vx: number = 0;
  private veri_vy: number = 0;

  private coveri_x_vx: number = 0;
  private coveri_y_vy: number = 0;

  constructor(
    initialState: { x: number; y: number; vx: number; vy: number },
    initialP: number[][] | null = null,
  ) {
    // Initialize Kalman filter state and configuration
    this.x = initialState.x;
    this.y = initialState.y;
    this.vx = initialState.vx;
    this.vy = initialState.vy;

    this.findVariances(initialState);
    this.X = this.convertStateToMatrix(initialState);

    // Initialize state covariance matrix (P)
    if (initialP) {
      this.P = initialP;
    } else {
      const defaultSigmaX = 1.0;
      const defaultSigmaY = 1.0;
      const defaultSigmaVx = 0.1;
      const defaultSigmaVy = 0.1;

      this.P = [
        [defaultSigmaX ** 2, 0, 0, 0],
        [0, defaultSigmaY ** 2, 0, 0],
        [0, 0, defaultSigmaVx ** 2, 0],
        [0, 0, 0, defaultSigmaVy ** 2],
      ];
    }
  }

  predict(dt: number): void {
    this.dt = dt;
    // Prediction step of the Kalman filter
    const A = [
      [1, 0, dt, 0],
      [0, 1, 0, dt],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];

    const A_T = util.transposeMatrix(A);

    const B = [
      [0.5 * dt ** 2, 0],
      [0, 0.5 * dt ** 2],
      [dt, 0],
      [0, dt],
    ];

    // Noise in the prediction
    this.Q = [
      [dt/3*0.9, 0, 0, 0],
      [0, dt/3*0.9, 0, 0],
      [0, 0, dt/3*0.9, 0],
      [0, 0, 0, dt/3*0.9],
    ];

    const X_prev = this.convertStateToMatrix({ x: this.x, y: this.y, vx: this.vx, vy: this.vy });
    const u_prev = this.convertAccelerationToMatrix({ x: this.ax, y: this.ay });

    const AX = util.multiplyMatrices(A, X_prev);
    const BU = util.multiplyMatrices(B, u_prev);

    this.X = util.addMatrices(AX, BU);

    this.x = this.X[0][0];
    this.y = this.X[1][0];
    this.vx = this.X[2][0];
    this.vy = this.X[3][0];

    const AP = util.multiplyMatrices(A, this.P);
    const APA_T = util.multiplyMatrices(AP, A_T);

    this.P = util.addMatrices(APA_T, this.Q);
  }

  correct(measurements: {
    x: number;
    y: number;
    vx: number;
    vy: number;
  }): void {
    this.findVariances(measurements);
    // Update the state based on the measurements
    // Y = C * X + Z

    const rowMeasurements = this.convertStateToMatrix(measurements);

    const C = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]

    // Noise in the measurements
    const Z = [
      [0],
      [0],
      [0],
      [0],
    ]

    const Y = util.addMatrices(util.multiplyMatrices(C, rowMeasurements), Z);

    // Measurement matrix (H)
    const H = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]

    // Measurement noise covariance (R) - variance of the measurement noise
     this.R = [
      [this.veri_x*0.9, 0, this.coveri_x_vx*0.6, 0],
      [0, this.veri_y*0.9, 0, this.coveri_y_vy*0.6],
      [this.coveri_x_vx*0.6, 0, this.veri_vx*0.9, 0],
      [0, this.coveri_y_vy*0.6, 0, this.veri_vy*0.9],
    ];

    // Kalman gain (K)
    this.K = this.calculateKalmanGain(H, this.R);

    // Residual (measurement error)
    const residual = this.calculateResidual(Y, H);

    // Correct the state based on the measurement
    // X = X + K * residual
    const K_residual = util.multiplyMatrices(this.K, residual);
    this.X = util.addMatrices(this.X, K_residual);

    // Update the state covariance matrix (P)
    // P = (I - K * H) * P
    const I = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    const KH = util.multiplyMatrices(this.K, H);
    const I_minus_KH = util.subtractMatrices(I, KH);
    this.P = util.multiplyMatrices(I_minus_KH, this.P);

    this.ax = (measurements.vx - this.vx)/this.dt;
    this.ay = (measurements.vy - this.vy)/this.dt;

    this.x = this.X[0][0];
    this.y = this.X[1][0];
    this.vx = this.X[2][0];
    this.vy = this.X[3][0];
  }

  private calculateKalmanGain(H: number[][], R: number[][]): number[][] {
    // K = P * H^T * (H * P * H^T + R)^(-1)
    const H_T = util.transposeMatrix(H);

    const PH_T = util.multiplyMatrices(this.P, H_T);

    const HPH_T = util.multiplyMatrices(H, PH_T);

    const HPH_T_plus_R = util.addMatrices(HPH_T, R);

    const HPH_T_plus_R_inverse = util.invert4x4(HPH_T_plus_R);

    const K_curr = util.multiplyMatrices(PH_T, HPH_T_plus_R_inverse);
    
    return K_curr;
  }

  private calculateResidual(
    Y: number[][],
    H: number[][],
  ): number[][] {
    // Residual = Y - H * state
    const HState = util.multiplyMatrices(H, this.X);
    const residual = util.subtractMatrices(Y, HState);

    return residual;
  }

  // Return the current state of the Kalman filter
  getState(): { x: number; y: number; vx: number; vy: number } {
    return { x: this.x, y: this.y, vx: this.vx, vy: this.vy };
  }

  getKalmanGain(): number[][] {
    return this.K;
  }

  getCovariance(): number[][] {
    return this.P;
  }

  private convertStateToMatrix(obj: { x: number; y: number; vx: number; vy: number }): number[][] {
    return [
      [obj.x],
      [obj.y],
      [obj.vx],
      [obj.vy],
    ];
  }

  private convertAccelerationToMatrix(obj: { x: number; y: number }): number[][] {
    return [
      [obj.x],
      [obj.y],
    ];
  }

  private findVariances(M: { x: number; y: number; vx: number; vy: number }): void {
    this.sum_x += M.x;
    this.sum_y += M.y;
    this.sum_vx += M.vx;
    this.sum_vy += M.vy;
    this.measurement_count += 1;

    this.sum_x_diff += (M.x - this.sum_x/this.measurement_count) ** 2;
    this.sum_y_diff += (M.y - this.sum_y/this.measurement_count) ** 2;
    this.sum_vx_diff += (M.vx - this.sum_vx/this.measurement_count) ** 2;
    this.sum_vy_diff += (M.vy - this.sum_vy/this.measurement_count) ** 2;

    this.sum_x_vx += (M.x - this.sum_x/this.measurement_count)*(M.vx - this.sum_vx/this.measurement_count);
    this.sum_y_vy += (M.y - this.sum_y/this.measurement_count)*(M.vy - this.sum_vy/this.measurement_count);

    this.veri_x = this.sum_x_diff/this.measurement_count;
    this.veri_y = this.sum_y_diff/this.measurement_count;
    this.veri_vx = this.sum_vx_diff/this.measurement_count;
    this.veri_vy = this.sum_vy_diff/this.measurement_count;

    this.coveri_x_vx =  this.sum_x_vx/this.measurement_count;
    this.coveri_y_vy =  this.sum_y_vy/this.measurement_count;

    console.log("variances: ", this.veri_x, this.veri_y, this.veri_vx, this.veri_vy);
  }
}
