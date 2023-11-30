export class util {
  public static multiplyMatrices(
    matrixA: number[][],
    matrixB: number[][]
  ): number[][] {
    const rowsA = matrixA.length;
    const colsA = matrixA[0].length;
    const rowsB = matrixB.length;
    const colsB = matrixB[0].length;

    if (colsA !== rowsB) {
      throw new Error("Matrix multiplication: Incompatible matrix dimensions");
    }

    const result: number[][] = [];

    for (let i = 0; i < rowsA; i++) {
      result[i] = [];
      for (let j = 0; j < colsB; j++) {
        result[i][j] = 0;
        for (let k = 0; k < colsA; k++) {
          result[i][j] += matrixA[i][k] * matrixB[k][j];
        }
      }
    }

    return result;
  }

  public static addMatrices(
    matrixA: number[][],
    matrixB: number[][]
  ): number[][] {
    const rowsA = matrixA.length;
    const colsA = matrixA[0].length;
    const rowsB = matrixB.length;
    const colsB = matrixB[0].length;

    if (rowsA !== rowsB || colsA !== colsB) {
      throw new Error("Incompatible matrix dimensions for addition");
    }

    const result: number[][] = [];

    for (let i = 0; i < rowsA; i++) {
      result[i] = [];

      for (let j = 0; j < colsA; j++) {
        result[i][j] = matrixA[i][j] + matrixB[i][j];
      }
    }

    return result;
  }

  public static transposeMatrix(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;

    const transposed: number[][] = new Array(cols).fill(null).map(() => []);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        transposed[j][i] = matrix[i][j];
      }
    }

    return transposed;
  }

  public static invert4x4(matrix: number[][]): number[][] {
    if (matrix.length !== 4 || matrix[0].length !== 4) {
      console.error("Input matrix must be 4x4.");
      throw new Error("Input matrix must be 4x4.");
    }
  
    const determinant = util.getDeterminantFrom4X4(matrix);
  
    if (determinant === 0) {
      console.error("Matrix is singular, cannot invert.");
      throw new Error("Matrix is singular, cannot invert.");
    }
  
    const invDet = 1 / determinant;
  
    const result: number[][] = [];
  
    for (let i = 0; i < 4; i++) {
      result[i] = [];
      for (let j = 0; j < 4; j++) {
        const cofactor = ((i + j) % 2 === 0 ? 1 : -1) *
          ((matrix[(j + 1) % 4][(i + 1) % 4] * matrix[(j + 2) % 4][(i + 2) % 4] * matrix[(j + 3) % 4][(i + 3) % 4]) -
            (matrix[(j + 1) % 4][(i + 2) % 4] * matrix[(j + 2) % 4][(i + 3) % 4] * matrix[(j + 3) % 4][(i + 1) % 4]) +
            (matrix[(j + 1) % 4][(i + 3) % 4] * matrix[(j + 2) % 4][(i + 1) % 4] * matrix[(j + 3) % 4][(i + 2) % 4]) -
            (matrix[(j + 1) % 4][(i + 1) % 4] * matrix[(j + 2) % 4][(i + 3) % 4] * matrix[(j + 3) % 4][(i + 2) % 4]) -
            (matrix[(j + 1) % 4][(i + 2) % 4] * matrix[(j + 2) % 4][(i + 1) % 4] * matrix[(j + 3) % 4][(i + 3) % 4]) +
            (matrix[(j + 1) % 4][(i + 3) % 4] * matrix[(j + 2) % 4][(i + 1) % 4] * matrix[(j + 3) % 4][(i + 2) % 4]));
  
        result[i][j] = cofactor * invDet;
      }
    }
  
    return result;
  }
  

  public static subtractMatrices(matrixA: number[][], matrixB: number[][]): number[][] {
    const rowsA = matrixA.length;
    const colsA = matrixA[0].length;
    const rowsB = matrixB.length;
    const colsB = matrixB[0].length;
  
    // Check if the matrices have the same dimensions
    if (rowsA !== rowsB || colsA !== colsB) {
      console.error('Matrices must have the same dimensions for subtraction.');
      throw new Error('Matrices must have the same dimensions for subtraction.');
    }
  
    // Perform matrix subtraction
    const result: number[][] = [];
  
    for (let i = 0; i < rowsA; i++) {
      result[i] = [];
  
      for (let j = 0; j < colsA; j++) {
        result[i][j] = matrixA[i][j] - matrixB[i][j];
      }
    }
  
    return result;
  }

  public static getDeterminantFrom4X4(matrix: number[][]): number {
    if (matrix.length !== 4 || matrix[0].length !== 4) {
      console.error("Input matrix must be 4x4.");
      throw new Error("Input matrix must be 4x4.");
    }

    const determinant =
      matrix[0][0] *
        util.getDeterminantFrom3X3([
          [matrix[1][1], matrix[1][2], matrix[1][3]],
          [matrix[2][1], matrix[2][2], matrix[2][3]],
          [matrix[3][1], matrix[3][2], matrix[3][3]],
        ]) -
      matrix[0][1] *
        util.getDeterminantFrom3X3([
          [matrix[1][0], matrix[1][2], matrix[1][3]],
          [matrix[2][0], matrix[2][2], matrix[2][3]],
          [matrix[3][0], matrix[3][2], matrix[3][3]],
        ]) +
      matrix[0][2] *
        util.getDeterminantFrom3X3([
          [matrix[1][0], matrix[1][1], matrix[1][3]],
          [matrix[2][0], matrix[2][1], matrix[2][3]],
          [matrix[3][0], matrix[3][1], matrix[3][3]],
        ]) -
      matrix[0][3] *
        util.getDeterminantFrom3X3([
          [matrix[1][0], matrix[1][1], matrix[1][2]],
          [matrix[2][0], matrix[2][1], matrix[2][2]],
          [matrix[3][0], matrix[3][1], matrix[3][2]],
        ]);

    return determinant;
  }

  public static getDeterminantFrom3X3(matrix: number[][]): number {
    if (matrix.length !== 3 || matrix[0].length !== 3) {
      console.error("Input matrix must be 3x3.");
      throw new Error("Input matrix must be 3x3.");
    }

    const determinant = matrix[0][0] * matrix[1][1] * matrix[2][2] +
        matrix[0][1] * matrix[1][2] * matrix[2][0] +
        matrix[0][2] * matrix[1][0] * matrix[2][1] -
        matrix[0][2] * matrix[1][1] * matrix[2][0] -
        matrix[0][1] * matrix[1][0] * matrix[2][2] -
        matrix[0][0] * matrix[1][2] * matrix[2][1];

    return determinant;
  }
}