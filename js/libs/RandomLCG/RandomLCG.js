// Implementador generador lineal congruente
// Se utilizan los valores de Borland C/C++
// Fecha: 10/6/23

class RandomLCG {
    constructor(seed) {
        this.seed = seed;

        this.multiplier = 22695477;
        this.increment = 1;
        this.module = 2^32;
    }

    setSeed(seed) {
        this.seed = seed;
    }

    generate() {
        this.seed = (this.multiplier * this.seed + this.increment) % this.module;

        return this.seed / this.module;
    }

    generateInRange(min, max) {
        return Math.floor(this.generate() * (max - min + 1) + min);
    }
}

export {RandomLCG}