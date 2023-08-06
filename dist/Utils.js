"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decompress = require("decompress");
const fs = require("fs");
const Database = require("better-sqlite3");
const path = require("path");
const StudySmarterStudySet_1 = require("./StudySmarterStudySet");
const moment = require("moment");
class Utils {
    constructor() {
    }
    static nullableMap(obj, fn) {
        if (obj === null || obj === undefined)
            return undefined;
        return fn(obj);
    }
    static nullableDateFormat(input) {
        return Utils.nullableMap(input, (i) => moment(i).format(Utils.DATE_FORMATS.DATETIME));
    }
    static getObjectWithoutKeys(obj, keys) {
        return Object.fromEntries(Object.entries(obj).filter(([k, v]) => !keys.includes(k)));
    }
    static parseColor(color) {
        let c;
        if (/^[0-9]+$/g.test(color))
            c = parseInt(color);
        else
            c = parseInt(StudySmarterStudySet_1.SetColor[color]);
        if (isNaN(c))
            throw new Error("Invalid color: " + color);
        return c;
    }
    static selectEnum(select, all) {
        const selected = all[select];
        if (!selected)
            throw new Error("Invalid selection: " + select + ", Valid: " + Object.keys(all).join(", "));
        return selected;
    }
    static collectOption(value, prev) {
        if (!prev)
            prev = [];
        prev.push(value);
        return prev;
    }
    static checkParamsAreSet(params) {
        Object.entries(params)
            .filter(([k, v]) => v === undefined || v === null)
            .forEach(([k, v]) => {
            throw new Error(`Invalid value ${k} === ${v}`);
        });
    }
    static regexExecArray(regex, str) {
        let matches = [];
        let match;
        while ((match = regex.exec(str)) !== null) {
            matches.push(match);
        }
        return matches;
    }
    static async convertFromAnki(file) {
        if (!fs.existsSync(file))
            throw new Error("File does not exist");
        if (!file.endsWith(".apkg"))
            throw new Error("File is not an apkg file");
        const outFolder = path.join(__dirname, "..", "unpackaged");
        if (fs.existsSync(outFolder))
            fs.rmSync(outFolder, { recursive: true });
        await decompress(file, outFolder);
        const media = JSON.parse(fs.readFileSync(path.join(outFolder, "media"), "utf8"));
        const imagePaths = [];
        Object.entries(media).forEach(([k, v]) => {
            const newPath = path.join(outFolder, v);
            fs.renameSync(path.join(outFolder, k), newPath);
            imagePaths.push({
                name: String(v),
                path: newPath
            });
        });
        const db = new Database(path.join(outFolder, "collection.anki21"), { readonly: true });
        const cols = db.prepare("SELECT * FROM col").all();
        const decks = [];
        cols.forEach(col => {
            Object.values(JSON.parse(col.decks)).forEach(((deck) => {
                const cards = db.prepare("select * from cards where did = ?").all(deck.id);
                decks.push({
                    id: deck.id,
                    name: deck.name,
                    cards: cards.map(card => db.prepare("select * from notes where id = ?").get(card["nid"]))
                        .map(note => {
                        const fields = note["flds"].split("\x1f");
                        return {
                            front: fields[0],
                            back: fields[1]
                        };
                    })
                });
            }));
        });
        return {
            decks,
            imagePaths,
            outFolder
        };
    }
    static async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
    static mapNullable(item, fn, nullValue) {
        if (item === null || item === undefined)
            return nullValue;
        return fn(item);
    }
    static encodeURLNullable(item) {
        return Utils.mapNullable(item, encodeURIComponent, "");
    }
}
exports.default = Utils;
Utils.DATE_FORMATS = {
    DATETIME: "DD.MM.YYYY hh:mm",
};
