"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHolidays = void 0;
const getHolidays = (year) => [
    `${year}-01-01`,
    `${year}-02-10`,
    `${year}-03-28`,
    `${year}-03-29`,
    `${year}-05-01`,
    `${year}-05-02`,
    `${year}-08-17`,
    `${year}-12-25`,
    `${year}-12-26`,
];
exports.getHolidays = getHolidays;
exports.default = exports.getHolidays;
