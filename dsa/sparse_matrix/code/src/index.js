const path = require("path");
const fs = require("fs");

class SparseMatrix {
  constructor(numRows, numCols) {
    this.numRows = numRows;
    this.numCols = numCols;
    this.elements = {}; // Store matrix elements as a dictionary of coordinates
  }

  // Load sparse matrix from file content
  static fromFile(fileContent) {
    const lines = fileContent.trim().split("\n");
    const numRows = parseInt(lines[0].split("=")[1], 10);
    const numCols = parseInt(lines[1].split("=")[1], 10);

    const matrix = new SparseMatrix(numRows, numCols);

    for (let i = 2; i < lines.length; i++) {
      const [row, col, value] = lines[i]
        .replace(/[()]/g, "") // Remove parentheses
        .split(",")
        .map(Number); // Convert string to numbers
      matrix.setElement(row, col, value);
    }

    return matrix;
  }

  // Load sparse matrix from file given its directory path
  static loadFromFile(filePath) {
    try {
      const absolutePath = path.resolve(filePath); // Resolve the absolute path
      const fileContent = fs.readFileSync(absolutePath, "utf-8");
      return this.fromFile(fileContent);
    } catch (err) {
      throw new Error(`Failed to load file: ${err.message}`);
    }
  }

  // Set an element in the matrix
  setElement(row, col, value) {
    if (row > this.numRows || col > this.numCols) {
      throw new Error(`Invalid row/col index: (${row}, ${col})`);
    }
    if (value !== 0) {
      this.elements[`${row},${col}`] = value;
    } else {
      delete this.elements[`${row},${col}`];
    }
  }

  // Get an element from the matrix (returns 0 if not present)
  getElement(row, col) {
    if (row > this.numRows || col > this.numCols) {
      throw new Error(`Invalid row/col index: (${row}, ${col})`);
    }
    return this.elements[`${row},${col}`] || 0;
  }

  // Add two sparse matrices
  add(otherMatrix) {
    this.checkMatrixCompatibility(otherMatrix);

    const result = new SparseMatrix(this.numRows, this.numCols);

    // Add elements from the first matrix
    for (const key in this.elements) {
      const [row, col] = key.split(",").map(Number);
      const sum = this.getElement(row, col) + otherMatrix.getElement(row, col);
      result.setElement(row, col, sum);
    }

    // Add remaining elements from the second matrix
    for (const key in otherMatrix.elements) {
      const [row, col] = key.split(",").map(Number);
      if (!this.elements[key]) {
        result.setElement(row, col, otherMatrix.getElement(row, col));
      }
    }

    return result;
  }

  // Subtract two sparse matrices
  subtract(otherMatrix) {
    this.checkMatrixCompatibility(otherMatrix);

    const result = new SparseMatrix(this.numRows, this.numCols);

    // Subtract elements from the matrices
    for (const key in this.elements) {
      const [row, col] = key.split(",").map(Number);
      const diff = this.getElement(row, col) - otherMatrix.getElement(row, col);
      result.setElement(row, col, diff);
    }

    for (const key in otherMatrix.elements) {
      const [row, col] = key.split(",").map(Number);
      if (!this.elements[key]) {
        result.setElement(row, col, -otherMatrix.getElement(row, col));
      }
    }

    return result;
  }

  // Multiply two sparse matrices
  multiply(otherMatrix) {
    if (this.numCols !== otherMatrix.numRows) {
      throw new Error("Matrix dimensions do not match for multiplication.");
    }

    const result = new SparseMatrix(this.numRows, otherMatrix.numCols);

    for (const keyA in this.elements) {
      const [rowA, colA] = keyA.split(",").map(Number);
      for (let colB = 0; colB < otherMatrix.numCols; colB++) {
        const valueB = otherMatrix.getElement(colA, colB);
        if (valueB !== 0) {
          const currentValue = result.getElement(rowA, colB);
          result.setElement(
            rowA,
            colB,
            currentValue + this.getElement(rowA, colA) * valueB
          );
        }
      }
    }

    return result;
  }

  // Check matrix size compatibility for addition and subtraction
  checkMatrixCompatibility(otherMatrix) {
    if (
      this.numRows !== otherMatrix.numRows ||
      this.numCols !== otherMatrix.numCols
    ) {
      throw new Error("Matrix dimensions do not match.");
    }
  }
}

// Load a sparse matrix from a file
const matrix1 = SparseMatrix.loadFromFile(
  "../../sample_inputs/easy_sample_01_2.txt"
);
const matrix2 = SparseMatrix.loadFromFile(
  "../../sample_inputs/easy_sample_01_2.txt"
);

// Perform addition
const addedMatrix = matrix1.add(matrix2);

// Perform subtraction
const subtractedMatrix = matrix1.subtract(matrix2);

// Perform multiplication
// const multipliedMatrix = matrix1.multiply(matrix2);

// Output the results
console.log("Added Matrix:", addedMatrix.elements);
console.log("Subtracted Matrix:", subtractedMatrix.elements);
// console.log("Multiplied Matrix:", multipliedMatrix.elements);
