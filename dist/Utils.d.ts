import StudySmarterStudySet, { SetColor } from "./StudySmarterStudySet";
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
    static selectEnum<T>(select: string, all: {
        [key: string]: T;
    }): T;
    static collectOption<T>(value: T, prev: T[]): T[];
    static checkParamsAreSet(params: any): void;
    static regexExecArray(regex: RegExp, str: string): RegExpExecArray[];
    static downloadImage(url: string, file: string): Promise<void>;
    static convertToAnki(set: StudySmarterStudySet, file: string): Promise<void>;
    static convertFromAnki(file: string): Promise<AnkiResult>;
    static sleep(ms: number): Promise<void>;
    static escapeRegExp(string: string): string;
    static mapNullable<T>(item: T, fn: (t: T) => any, nullValue?: any): any;
    static encodeURLNullable(item?: string | number | boolean): string;
}
export {};
