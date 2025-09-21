"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportFileName = exportFileName;
const months_1 = __importDefault(require("./months"));
function exportFileName(title, monthIndex) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const idx = typeof monthIndex === 'number' && monthIndex >= 1 && monthIndex <= 12
        ? monthIndex - 1
        : now.getMonth();
    const monthName = months_1.default[idx];
    return `${dd}${mm}${yyyy}_${hh}${min}_${title}_${monthName}`;
}
exports.default = exportFileName;
