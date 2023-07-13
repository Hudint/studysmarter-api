import * as decompress from 'decompress';
import * as fs from "fs";
import * as Database from 'better-sqlite3';

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
    imagePaths: {name: string, path: string}[]
}

export default class Utils {
    private constructor() {
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

    public static async convertFromAnki(file: string): Promise<AnkiResult>{
        fs.rmSync("unpackaged/", {recursive: true});
        await decompress(file, "unpackaged");
        const media = JSON.parse(fs.readFileSync("unpackaged/media", "utf8"));
        const imagePaths: {name: string, path: string}[] = [];
        Object.entries(media).forEach(([k, v]) => {
            fs.renameSync(`unpackaged/${k}`, `unpackaged/${v}`)
            imagePaths.push({
                name: String(v),
                path: `unpackaged/${v}`
            });
        })

        const db = new Database("unpackaged/collection.anki21");
        const cols: any[] = db.prepare("SELECT * FROM col").all();
        const decks : Deck[] = [];
        cols.forEach(col => {
            Object.values(JSON.parse(col.decks)).forEach(((deck: any) => {
                const cards = db.prepare("select * from cards where did = ?").all(deck.id);
                decks.push({
                    id: deck.id,
                    name: deck.name,
                    cards: cards.map(card => db.prepare("select * from notes where id = ?").get(card["nid"]))
                        .map(note => ({
                            front: note["sfld"],
                            back: note["flds"]
                        }))
                })
            }))
        })

        return {
            decks,
            imagePaths
        };
    }
}