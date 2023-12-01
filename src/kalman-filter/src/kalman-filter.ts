/* eslint-disable @typescript-eslint/no-unused-vars */

import { util } from "./util";

export class KalmanFilter {
  private earth_R = 6366707.0195  //Earth radius in meters
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

  private measurement_count: number = 0;

  constructor(
    initialState: { x: number; y: number; vx: number; vy: number },
    initialP: number[][] | null = null,
  ) {
    // Initialize Kalman filter state and configuration
    this.x = initialState.x;
    this.y = initialState.y;
    this.vx = initialState.vx;
    this.vy = initialState.vy;

    //this.findVariances(initialState);
    this.X = this.convertStateToMatrix(initialState);

    // Initialize state covariance matrix (P)
    if (initialP) {
      this.P = initialP;
    } else {
      const defaultSigmaX = 1000;
      const defaultSigmaY = 1000;
      const defaultSigmaVx = 100;
      const defaultSigmaVy = 100;

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
      [1, 0, (dt*(5/18)/this.earth_R), 0],
      [0, 1, 0, (dt*(5/18)/(this.earth_R*Math.cos(this.x)))],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];

    const A_T = util.transposeMatrix(A);

    const B = [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ];


    const positionUncertaintyInPrediction = 2; // Adjust based on the accuracy of the prediction
    const velocityUncertaintyInPrediction = 1.5; // Adjust based on the accuracy of the prediction
    
    // Noise in the prediction
    this.Q = [
      [positionUncertaintyInPrediction, 0, 0, 0],
      [0, positionUncertaintyInPrediction, 0, 0],
      [0, 0, velocityUncertaintyInPrediction, 0],
      [0, 0, 0, velocityUncertaintyInPrediction],
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
    //this.findVariances(measurements);
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

    const measNoiseInPosition = 1.5; // Adjust based on the accuracy of the measurement
    const measNoiseInVelocity = 0.8; // Adjust based on the accuracy of the measurement
     this.R = [
      [measNoiseInPosition, 0, 0, 0],
      [0, measNoiseInPosition, 0, 0],
      [0, 0, measNoiseInVelocity, 0],
      [0, 0, 0, measNoiseInVelocity],
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
    // P = P - K * H * P

    const KH = util.multiplyMatrices(this.K, H);
    const KHP = util.multiplyMatrices(KH, this.P);
    this.P = util.subtractMatrices(this.P, KHP);

    this.x = this.X[0][0];
    this.y = this.X[1][0];
    this.vx = this.X[2][0];
    this.vy = this.X[3][0];

    this.ax = (measurements.vx - this.vx)/this.dt;
    this.ay = (measurements.vy - this.vy)/this.dt;
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
}
