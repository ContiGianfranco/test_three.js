// Codigo de https://yonatankra.com/how-to-create-terrain-and-heightmaps-using-the-diamond-square-algorithm-in-javascript/
// fecha: 28/5/23

import {RandomLCG} from "../RandomLCG/RandomLCG";

class DiamondSquareGenerator {
    // matrix_length must be 2^N + 1
    constructor(random_range, matrix_length, seed) {
        this.random_range = random_range;
        this.matrix_length = matrix_length;
        this.random = new RandomLCG(seed);
        this.matrix = this.generateMatrix();
    }

    generateData(){
        return this.diamondSquare(this.matrix)
    }

    generateMatrix() {
        const matrix = new Array(this.matrix_length)
            .fill(0)
            .map(() => new Array(this.matrix_length).fill(null));

        matrix[0][this.matrix_length - 1] = this.random.generateInRange(0, this.random_range);
        matrix[this.matrix_length - 1][0] = this.random.generateInRange(0, this.random_range);
        matrix[0][0] = this.random.generateInRange(0, this.random_range);
        matrix[this.matrix_length - 1][this.matrix_length - 1] = this.random.generateInRange(
            0,
            this.random_range
        );

        return matrix;
    }

    diamondSquare(matrix) {
        let chunkSize = this.matrix_length - 1;
        let randomFactor = this.random_range;

        while (chunkSize > 1) {
            this.calculateSquare(matrix, chunkSize, randomFactor)

            this.calculateDiamond(matrix, chunkSize, randomFactor)

            chunkSize /= 2;
            randomFactor /= 2;
        }

        return matrix;
    }

    calculateDiamond(matrix, chunkSize, randomFactor) {
        for (let i = 0; i < matrix.length - 1; i += chunkSize) {
            for (let j = 0; j < matrix.length - 1; j += chunkSize) {
                const BOTTOM_RIGHT = matrix[j + chunkSize]
                    ? matrix[j + chunkSize][i + chunkSize]
                    : null;
                const BOTTOM_LEFT = matrix[j + chunkSize]
                    ? matrix[j + chunkSize][i]
                    : null;
                const TOP_LEFT = matrix[j][i];
                const TOP_RIGHT = matrix[j][i + chunkSize];
                const { count, sum } = [
                    BOTTOM_RIGHT,
                    BOTTOM_LEFT,
                    TOP_LEFT,
                    TOP_RIGHT
                ].reduce(
                    (result, value) => {
                        if (isFinite(value) && value != null) {
                            result.sum += value;
                            result.count += 1;
                        }
                        return result;
                    },
                    { sum: 0, count: 0 }
                );
                const changed = {row: j + chunkSize / 2, column: i + chunkSize / 2};
                matrix[changed.row][changed.column] =
                    sum / count + this.random.generateInRange(-randomFactor, randomFactor);
            }
        }
        return matrix;
    }

    calculateSquare(matrix, chunkSize, randomFactor) {
        const half = chunkSize / 2;
        for (let y = 0; y < matrix.length; y += half) {
            for (let x = (y + half) % chunkSize; x < matrix.length; x += chunkSize) {
                const BOTTOM = matrix[y + half] ? matrix[y + half][x] : null;
                const LEFT = matrix[y][x - half];
                const TOP = matrix[y - half] ? matrix[y - half][x] : null;
                const RIGHT = matrix[y][x + half];
                const { count, sum } = [BOTTOM, LEFT, TOP, RIGHT].reduce(
                    (result, value) => {
                        if (isFinite(value) && value != null) {
                            result.sum += value;
                            result.count += 1;
                        }
                        return result;
                    },
                    { sum: 0, count: 0 }
                );
                matrix[y][x] = sum / count + this.random.generateInRange(-randomFactor, randomFactor);
            }
        }
        return matrix;
    }
}

export {DiamondSquareGenerator}