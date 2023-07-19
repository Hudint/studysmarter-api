"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const storagePath = path.join(__dirname, "..", "data.json");
class DataStorage {
    constructor() { }
    static get(key) {
        return this.data[key];
    }
    static set(key, value) {
        this.data[key] = value;
        fs.writeFileSync(storagePath, JSON.stringify(this.data));
    }
}
(() => {
    if (!fs.existsSync(storagePath)) {
        fs.writeFileSync(storagePath, "{}");
    }
})();
DataStorage.data = JSON.parse(fs.readFileSync(storagePath, "utf8"));
exports.default = DataStorage;
