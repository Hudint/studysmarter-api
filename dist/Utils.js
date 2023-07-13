"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decompress = require("decompress");
const fs = require("fs");
const Database = require("better-sqlite3");
class Utils {
    constructor() {
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
        fs.rmSync("unpackaged/", { recursive: true });
        await decompress(file, "unpackaged");
        const media = JSON.parse(fs.readFileSync("unpackaged/media", "utf8"));
        const imagePaths = [];
        Object.entries(media).forEach(([k, v]) => {
            fs.renameSync(`unpackaged/${k}`, `unpackaged/${v}`);
            imagePaths.push({
                name: String(v),
                path: `unpackaged/${v}`
            });
        });
        const db = new Database("unpackaged/collection.anki21");
        const cols = db.prepare("SELECT * FROM col").all();
        const decks = [];
        cols.forEach(col => {
            Object.values(JSON.parse(col.decks)).forEach(((deck) => {
                const cards = db.prepare("select * from cards where did = ?").all(deck.id);
                decks.push({
                    id: deck.id,
                    name: deck.name,
                    cards: cards.map(card => db.prepare("select * from notes where id = ?").get(card["nid"]))
                        .map(note => ({
                        front: note["sfld"],
                        back: note["flds"]
                    }))
                });
            }));
        });
        return {
            decks,
            imagePaths
        };
    }
}
exports.default = Utils;
