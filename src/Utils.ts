import * as decompress from 'decompress';
import * as fs from "fs";
import * as Database from 'better-sqlite3';
import * as path from "path";
// import { Apkg } from "@seangenabe/apkg"
import StudySmarterStudySet from "./StudySmarterStudySet";
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

let currentMediaId = 0;
function getNextMediaId(){
    return currentMediaId++;
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
        return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
    }

    public static selectIntEnum<T>(select: string, all: any): T {
        let c : any;
        if(/^[0-9]+$/g.test(select)) c = parseInt(select);
        else c = parseInt(all[select]);
        if(isNaN(c)) throw new Error("Invalid value: " + select);
        return c;
    }

    public static selectEnum<T>(select: string, all: {[key: string]: T}): T {
        const selected = all[select];
        if(!selected) throw new Error("Invalid selection: " + select + ", Valid: " + Object.keys(all).join(", "));
        return selected;
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

    public static async downloadImage(url: string, file: string) {
        const response = await fetch(url);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(file, buffer);
    }

    public static async convertToAnki(set: StudySmarterStudySet, file: string) {
        // if (fs.existsSync(file)) throw new Error("File does already exist");
        //
        // const folder = path.join(__dirname, "..", "tmp");
        // if(!fs.existsSync(folder))
        //     fs.mkdirSync(folder)
        //
        //
        // const apkg = new Apkg();
        // apkg
        //
        // const cards = await set.getFlashCards();
        //
        // cards.forEach(card => {
        //     card.flashcard_images.map(image => {
        //         const id = getNextMediaId();
        //         console.log(image.image_string.match(/^.*\/([/]+)$/)[1])
        //         // const out = path.join(folder, id + ".png");
        //         // Utils.downloadImage(image.presigned_url, out);
        //
        //     })
        // })
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
        db.close();

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


    public static mapNullable<T>(item: T, fn: (t: T) => any, nullValue?: any): any{
        if(item === null || item === undefined) return nullValue;
        return fn(item);
    }

    public static encodeURLNullable(item?: string | number | boolean): string{
        return Utils.mapNullable(item, encodeURIComponent, "");
    }
}
