import { util } from "./util";

describe('Utility Functions', () => {
  it('should correctly correctly adding matrices', () => {
    const matrixA = [
      [1, 2],
      [3, 4],
    ];

    const matrixB = [
      [5, 6],
      [7, 8],
    ];

    const result = util.addMatrices(matrixA, matrixB);

    const expectedResult = [
      [6, 8],
      [10, 12],
    ];

    expect(result).toEqual(expectedResult);
  });

  it('should correctly correctly multiplying matrices', () => {
    const matrixA = [
      [1, 2],
      [3, 4],
    ];

    const matrixB = [
      [5, 6],
      [7, 8],
    ];

    const result = util.multiplyMatrices(matrixA, matrixB);

    const expectedResult = [
      [19, 22],
      [43, 50],
    ];

    expect(result).toEqual(expectedResult);
  });

  it('should correctly invert 4X4 matrix', () => {
    const matrix = [
      [1, 2, 3, 4],
      [0, 1, 2, 3],
      [0, 0, 1, 2],
      [0, 0, 0, 1],
    ]

    const result = util.invert4x4(matrix);

    const expectedResult = [
    [ 1, -2,  1,  0],
    [ 0,  1, -2,  1],
    [ 0,  0,  1, -2],
    [ 0,  0,  0,  1,]
  ];

    expect(result).toEqual(expectedResult);
  });

  it('should correctly transpose matrix', () => {
    const matrix = [
      [1, 2, 3, 4],
      [0, 1, 2, 3],
    ];

    const result = util.transposeMatrix(matrix);

    const expectedResult = [
      [1, 0],
      [2, 1],
      [3, 2],
      [4, 3],
    ];

    expect(result).toEqual(expectedResult);
  });

  it('should correctly subtract matrices', () => {
    const matrixA = [
      [1, 2],
      [3, 4],
    ];

    const matrixB = [
      [5, 6],
      [7, 8],
    ];

    const result = util.subtractMatrices(matrixA, matrixB);

    const expectedResult = [
      [-4, -4],
      [-4, -4],
    ];

    expect(result).toEqual(expectedResult);
  });

  it('should correctly calculate determinant of 4X4 matrix', () => {
    const matrix = [
      [1, 2, 3, 4],
      [0, 1, 2, 3],
      [0, 0, 1, 2],
      [0, 0, 0, 1],
    ];

    const result = util.getDeterminantFrom4X4(matrix);

    const expectedResult = 1;

    expect(result).toEqual(expectedResult);
  });

  it('should correctly calculate determinant of 3X3 matrix', () => {
    const matrix = [
      [1, 2, 3],
      [0, 1, 2],
      [0, 0, 1],
    ];

    const result = util.getDeterminantFrom3X3(matrix);

    const expectedResult = 1;

    expect(result).toEqual(expectedResult);
  });

  it('should correctly format object', () => {
    const object = {
      reportedAt: '2023-11-29T10:35:08.000Z',
      longitude: 80.39655666666667,
      latitude: 8.067295,
      speed: 20,
      legDistance: 0,
      course: 284,
    };
    const courseRadians = object.course * Math.PI / 180;
    const expectedResult = {
      x: 8.067295,
      y: 80.39655666666667,
      vx: 20 * Math.cos(courseRadians),
      vy: 20 * Math.sin(courseRadians),
    };

    const result = util.convertObject(object);

    expect(result).toEqual(expectedResult);

  });
});

