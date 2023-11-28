import { KalmanFilter } from './kalman-filter';

describe('KalmanFilter', () => {
  it('should correctly initiate state', () => {
    const initialState = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
    };

    const kalmanFilter = new KalmanFilter(initialState);

    const state = kalmanFilter.getState();

    expect(state).toEqual(initialState);
  });

  it('should correctly predict and correct state', () => {
    const initialState = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
    };

    const kalmanFilter = new KalmanFilter(initialState);

    const measurements = { x: 2, y: 2, speed: 1, course: 180 };

    const dt = 1;
    kalmanFilter.predict(dt);

    kalmanFilter.correct(measurements);

    const updatedState = kalmanFilter.getState();

    const expectedState = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
    };

    expect(updatedState).toEqual(expectedState);
  });
});
