// utils.js
function add(a, b) {
    return a + b;
}
module.exports = add;

// utils.test.js
const add = require('./utils');

describe('add fonksiyonu', () => {
    it('iki pozitif sayıyı toplamalı', () => {
        expect(add(2, 3)).toBe(5);
    });

    it('bir negatif ve bir pozitif sayıyı toplamalı', () => {
        expect(add(-2, 3)).toBe(1);
    });
});

