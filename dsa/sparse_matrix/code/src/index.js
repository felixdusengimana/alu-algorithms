const fs = require("fs");
const readline = require("readline");

class SparseMatrix {
  constructor(numRows, numCols) {
    this.elements = new Map();
    this.rows = numRows;
    this.cols = numCols;
  }

  /**
   * Static method to create a SparseMatrix from a file path
   * @param {string} matrixFilePath - Path to the matrix file
   * @returns {SparseMatrix} A new SparseMatrix instance
   */
  static fromFile(matrixFilePath) {
    try {
      const fileContent = fs.readFileSync(matrixFilePath, "utf8");
      const lines = fileContent.trim().split("\n");

      if (lines.length < 2) {
        throw new Error(
          `File ${matrixFilePath} does not contain enough lines for matrix dimensions`
        );
      }

      // Parse dimensions
      const rowMatch = lines[0].trim().match(/rows=(\d+)/);
      const colMatch = lines[1].trim().match(/cols=(\d+)/);

      if (!rowMatch || !colMatch) {
        throw new Error(
          `Invalid dimension format in file ${matrixFilePath}. Expected 'rows=X' and 'cols=Y'`
        );
      }

      const numRows = parseInt(rowMatch[1]);
      const numCols = parseInt(colMatch[1]);

      if (isNaN(numRows) || isNaN(numCols)) {
        throw new Error(
          `Invalid matrix dimensions: rows=${rowMatch[1]}, cols=${colMatch[1]}. Numbers expected.`
        );
      }

      const matrix = new SparseMatrix(numRows, numCols);

      // Parse elements
      for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue; // Skip empty lines

        const match = line.match(/\((\d+),\s*(\d+),\s*(-?\d+)\)/);
        if (!match) {
          throw new Error(
            `Invalid format at line ${i + 1} in file ${matrixFilePath}: ${line}`
          );
        }

        const row = parseInt(match[1]);
        const col = parseInt(match[2]);
        const value = parseInt(match[3]);

        matrix.setElement(row, col, value);
      }

      return matrix;
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(`File not found: ${matrixFilePath}`);
      }
      throw error;
    }
  }

  getElement(row, col) {
    const key = `${row},${col}`;
    return this.elements.get(key) || 0;
  }

  setElement(row, col, value) {
    if (row >= this.rows) this.rows = row + 1;
    if (col >= this.cols) this.cols = col + 1;

    const key = `${row},${col}`;
    this.elements.set(key, value);
  }

  add(other) {
    const maxRows = Math.max(this.rows, other.rows);
    const maxCols = Math.max(this.cols, other.cols);
    const result = new SparseMatrix(maxRows, maxCols);

    // check if dimensions are compatible
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error(
        `Matrix dimensions do not match for addition. First matrix is ${this.rows}x${this.cols} and second matrix is ${other.rows}x${other.cols}`
      );
    }

    // Add all elements from this matrix
    for (const [key, value] of this.elements) {
      const [row, col] = key.split(",").map(Number);
      result.setElement(row, col, value);
    }

    // Add all elements from other matrix
    for (const [key, value] of other.elements) {
      const [row, col] = key.split(",").map(Number);
      const currentValue = result.getElement(row, col);
      result.setElement(row, col, currentValue + value);
    }

    return result;
  }

  subtract(other) {
    const maxRows = Math.max(this.rows, other.rows);
    const maxCols = Math.max(this.cols, other.cols);
    const result = new SparseMatrix(maxRows, maxCols);

    // check if dimensions are compatible
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error(
        `Matrix dimensions do not match for subtraction. First matrix is ${this.rows}x${this.cols} and second matrix is ${other.rows}x${other.cols}`
      );
    }

    // Add all elements from this matrix
    for (const [key, value] of this.elements) {
      const [row, col] = key.split(",").map(Number);
      result.setElement(row, col, value);
    }

    // Subtract all elements from other matrix
    for (const [key, value] of other.elements) {
      const [row, col] = key.split(",").map(Number);
      const currentValue = result.getElement(row, col);
      result.setElement(row, col, currentValue - value);
    }

    return result;
  }

  multiply(other) {
    if (this.cols !== other.rows) {
      throw new Error(
        `Invalid dimensions for multiplication. First matrix columns (${this.cols}) must match second matrix rows (${other.rows})`
      );
    }

    const result = new SparseMatrix(this.rows, other.cols);

    for (const [key1, value1] of this.elements) {
      const [row1, col1] = key1.split(",").map(Number);

      for (const [key2, value2] of other.elements) {
        const [row2, col2] = key2.split(",").map(Number);

        if (col1 === row2) {
          const currentValue = result.getElement(row1, col2);
          result.setElement(row1, col2, currentValue + value1 * value2);
        }
      }
    }

    return result;
  }

  toString() {
    let result = `rows=${this.rows}\ncols=${this.cols}\n`;
    for (const [key, value] of this.elements) {
      const [row, col] = key.split(",");
      result += `(${row}, ${col}, ${value})\n`;
    }
    return result.trim();
  }

  saveToFile(filePath) {
    const content = this.toString();
    fs.writeFileSync(filePath, content);
  }
}

async function performMatrixOperation() {
  try {
    const operations = {
      1: { name: "addition", method: "add" },
      2: { name: "subtraction", method: "subtract" },
      3: { name: "multiplication", method: "multiply" },
    };

    console.log("Sparse Matrix Operations");
    console.log("1. Addition");
    console.log("2. Subtraction");
    console.log("3. Multiplication");

    const choice = await getUserInput("Choose operation (1-3): ");
    if (!operations[choice]) {
      throw new Error("Invalid choice");
    }

    const file1 = await getUserInput("Enter path for first matrix file: ");
    const file2 = await getUserInput("Enter path for second matrix file: ");

    console.log(`Loading first matrix from ${file1}...`);
    const matrix1 = SparseMatrix.fromFile(file1);
    console.log(
      `Successfully loaded matrix of size ${matrix1.rows}x${matrix1.cols}`
    );

    console.log(`Loading second matrix from ${file2}...`);
    const matrix2 = SparseMatrix.fromFile(file2);
    console.log(
      `Successfully loaded matrix of size ${matrix2.rows}x${matrix2.cols}`
    );

    const operation = operations[choice];
    console.log(`Performing ${operation.name}...`);
    const result = matrix1[operation.method](matrix2);

    const outputFile = `result_${operation.name}.txt`;
    result.saveToFile(outputFile);

    console.log(
      `Operation completed successfully. Result saved to ${outputFile}`
    );
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function getUserInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

performMatrixOperation();
