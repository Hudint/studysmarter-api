import { SetColor } from "./StudySmarterStudySet";
type Card = {
    front: string;
    back: string;
};
type Deck = {
    id: number;
    name: string;
    cards: Card[];
};
type AnkiResult = {
    decks: Deck[];
    imagePaths: {
        name: string;
        path: string;
    }[];
    outFolder: string;
};
export default class Utils {
    static readonly DATE_FORMATS: {
        DATETIME: string;
    };
    private constructor();
    static nullableMap<T, R>(obj: T, fn: (o: T) => R): R;
    static nullableDateFormat(input: string): string;
    static getObjectWithoutKeys(obj: any, keys: string[]): any;
    static parseColor(color: string): SetColor;
    static collectOption<T>(value: T, prev: T[]): T[];
    static checkParamsAreSet(params: any): void;
    static regexExecArray(regex: RegExp, str: string): RegExpExecArray[];
    static convertFromAnki(file: string): Promise<AnkiResult>;
}
export {};
