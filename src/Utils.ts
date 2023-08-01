import * as decompress from 'decompress';
import * as fs from "fs";
import * as Database from 'better-sqlite3';
import * as path from "path";
import {SetColor} from "./StudySmarterStudySet";
import moment = require("moment");

type Card = {
    front: string,
    back: string
}

type Deck = {
    id: number,
    name: string,
    cards: Card[]
}

type AnkiResult = {
    decks: Deck[],
    imagePaths: { name: string, path: string }[],
    outFolder: string
}

export default class Utils {
    public static readonly DATE_FORMATS = {
        DATETIME: "DD.MM.YYYY hh:mm",
    }

    private constructor() {
    }

    public static nullableMap<T, R>(obj: T, fn: (o: T) => R){
        if(obj === null || obj === undefined) return undefined;
        return fn(obj);
    }

    public static nullableDateFormat(input: string) {
        return Utils.nullableMap(input, (i) => moment(i).format(Utils.DATE_FORMATS.DATETIME));
    }

    public static getObjectWithoutKeys(obj: any, keys: string[]): any {
        return Object.fromEntries(Object.entries(obj).filter(([k, v]) => !keys.includes(k)));
    }

    public static parseColor(color: string): SetColor {
        let c;
        if(/^[0-9]+$/g.test(color)) c = parseInt(color);
        else c = parseInt(SetColor[color]);

        if(isNaN(c)) throw new Error("Invalid color: " + color);

        return c;
    }

    public static collectOption<T>(value: T, prev: T[]): T[]{
        if(!prev) prev = [];
        prev.push(value);
        return prev;
    }

    public static checkParamsAreSet(params: any): void {
        Object.entries(params)
            .filter(([k, v]) => v === undefined || v === null)
            .forEach(([k, v]) => {
                throw new Error(`Invalid value ${k} === ${v}`)
            });
    }

    public static regexExecArray(regex: RegExp, str: string) {
        let matches: RegExpExecArray[] = [];
        let match: RegExpExecArray;
        while ((match = regex.exec(str)) !== null) {
            matches.push(match);
        }
        return matches;
    }

    public static async convertFromAnki(file: string): Promise<AnkiResult> {
        if (!fs.existsSync(file)) throw new Error("File does not exist");
        if(!file.endsWith(".apkg")) throw new Error("File is not an apkg file");

        const outFolder = path.join(__dirname, "..", "unpackaged");

        if (fs.existsSync(outFolder)) fs.rmSync(outFolder, {recursive: true});

        await decompress(file, outFolder);
        const media = JSON.parse(fs.readFileSync(path.join(outFolder, "media"), "utf8"));
        const imagePaths: { name: string, path: string }[] = [];
        Object.entries(media).forEach(([k, v] : [string, string]) => {
            const newPath = path.join(outFolder, v);
            fs.renameSync(path.join(outFolder, k), newPath)
            imagePaths.push({
                name: String(v),
                path: newPath
            });
        })

        const db = new Database(path.join(outFolder, "collection.anki21"), {readonly: true});
        const cols: any[] = db.prepare("SELECT * FROM col").all();
        const decks: Deck[] = [];
        cols.forEach(col => {
            Object.values(JSON.parse(col.decks)).forEach(((deck: any) => {
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
                            }
                        })
                })
            }))
        })

        return {
            decks,
            imagePaths,
            outFolder
        };
    }

    public static async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public static escapeRegExp(string: string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
}