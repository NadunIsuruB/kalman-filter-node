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

    // Create the augmented matrix [A | I]
    const augmentedMatrix: number[][] = matrix.map((row, i) => [
      ...row,
      ...new Array(4).fill(0).map((_, j) => (i === j ? 1 : 0)),
    ]);

    // Apply Gauss-Jordan elimination
    for (let col = 0; col < 4; col++) {
      // Find the pivot row
      let pivotRow = col;
      for (let row = col + 1; row < 4; row++) {
        if (
          Math.abs(augmentedMatrix[row][col]) >
          Math.abs(augmentedMatrix[pivotRow][col])
        ) {
          pivotRow = row;
        }
      }

      // Swap rows to make the pivot element non-zero
      [augmentedMatrix[col], augmentedMatrix[pivotRow]] = [
        augmentedMatrix[pivotRow],
        augmentedMatrix[col],
      ];

      const pivot = augmentedMatrix[col][col];

      if (pivot === 0) {
        console.error("Matrix is not invertible.");
        throw new Error("Matrix is not invertible.");
      }

      // Scale the pivot row to have a leading 1
      for (let i = 0; i < 8; i++) {
        augmentedMatrix[col][i] /= pivot;
      }

      // Eliminate other rows
      for (let row = 0; row < 4; row++) {
        if (row !== col) {
          const factor = augmentedMatrix[row][col];
          for (let i = 0; i < 8; i++) {
            augmentedMatrix[row][i] -= factor * augmentedMatrix[col][i];
          }
        }
      }
    }

    // Extract the inverted matrix from the augmented matrix
    const invertedMatrix: number[][] = augmentedMatrix.map((row) =>
      row.slice(4)
    );

    return invertedMatrix;
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