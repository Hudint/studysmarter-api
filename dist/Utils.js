"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    constructor() { }
    static checkParamsAreSet(params) {
        Object.entries(params)
            .filter(([k, v]) => v === undefined || v === null)
            .forEach(([k, v]) => {
            throw new Error(`Invalid value ${k} === ${v}`);
        });
    }
    static forEachRegex(regex, str, callback) {
        let match;
        while ((match = regex.exec(str)) !== null) {
            callback(match);
        }
    }
}
exports.default = Utils;
