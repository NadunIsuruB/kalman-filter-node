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
      x: 2,
      y: 3,
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
      x: 2,
      y: 3,
      vx: 1,
      vy: 1,
    };

    expect(updatedState).toEqual(expectedState);
  });

  it('should correctly predict and correct state for 10 rounds with acceleration', () => {
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
      { x: 100, y: 50, vx: 1, vy: 2 },
      { x: 50, y: 25, vx: 1, vy: 1 },
      { x: 13, y: 15, vx: 1, vy: 2 },
    ];

    for (let i = 0; i < measurements.length; i++) {
      const dt = 1;
      kalmanFilter.predict(dt);

      const currentState = kalmanFilter.getState();

      //console.log(`Round ${i + 1}: Before Correct - `, currentState);

      kalmanFilter.correct(measurements[i]);

      const currentState1 = kalmanFilter.getState();

      //console.log(`Round ${i + 1}: After Correct - `, currentState1);
    }

    const updatedState = kalmanFilter.getState();

    const expectedState = {
      x: 11,
      y: 12,
      vx: 1,
      vy: 1,
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
      console.log(`Round ${i + 1}: Before Predict - `, util.getDeterminantFrom4X4(beforePredictP) , `After Predict - `, util.getDeterminantFrom4X4(afterPredictP));
    }
  });
});
