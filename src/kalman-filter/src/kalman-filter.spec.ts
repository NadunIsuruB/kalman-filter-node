import { KalmanFilter } from './kalman-filter';
import { util } from './util';

describe('KalmanFilter', () => {
  it('should correctly initiate state', () => {
    const initialState = {
      x: 1,
      y: 0,
      vx: 1,
      vy: 0,
    };

    const kalmanFilter = new KalmanFilter(initialState);

    const state = kalmanFilter.getState();

    expect(state).toEqual(initialState);
  });

  it('should correctly predict state', () => {
    const initialState = {
      x: 1,
      y: 2,
      vx: 1,
      vy: 1,
    };

    const kalmanFilter = new KalmanFilter(initialState);

    const measurements = { x: 2, y: 2, xv: 1, yv: 2 };

    const dt = 1;
    kalmanFilter.predict(dt);

    const updatedState = kalmanFilter.getState();

    const expectedState = {
      x: 1.000000043629741,
      y: 2.00000008075061,
      vx: 1,
      vy: 1,
    };

    expect(updatedState).toEqual(expectedState);
  });

  it('should correctly correct state', () => {
    const initialState = {
      x: 1,
      y: 2,
      vx: 1,
      vy: 1,
    };

    const kalmanFilter = new KalmanFilter(initialState);

    const measurements = { x: 2, y: 2, vx: 1, vy: 2 };

    const dt = 1;
    kalmanFilter.predict(dt);

    kalmanFilter.correct(measurements);

    const updatedState = kalmanFilter.getState();

    const expectedState = {
      vx: 1.0000000000000349,
      vy: 1.999920018395769,
      x: 1.9999985000053155,
      y: 2.000000000000242,
    };

    expect(updatedState).toEqual(expectedState);
  });

  it('should predict 10 times and gain uncertainty', () => {
    const initialState = {
      x: 1,
      y: 2,
      vx: 1,
      vy: 1,
    };

    const kalmanFilter = new KalmanFilter(initialState);

    for (let i = 0; i < 10; i++) {
      const dt = 1;

      const beforePredictP = kalmanFilter.getCovariance();

      kalmanFilter.predict(dt);

      const afterPredictP = kalmanFilter.getCovariance();

      expect(util.getDeterminantFrom4X4(afterPredictP)).toBeGreaterThan(util.getDeterminantFrom4X4(beforePredictP));
    }
  });
});
