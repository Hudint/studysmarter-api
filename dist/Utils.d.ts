import { SetColor } from "./StudySmarterStudySet";
declare type Card = {
    front: string;
    back: string;
};
declare type Deck = {
    id: number;
    name: string;
    cards: Card[];
};
declare type AnkiResult = {
    decks: Deck[];
    imagePaths: {
        name: string;
        path: string;
    }[];
    outFolder: string;
};
export default class Utils {
    private constructor();
    static parseColor(color: string): SetColor;
    static collectOption<T>(value: T, prev: T[]): T[];
    static checkParamsAreSet(params: any): void;
    static regexExecArray(regex: RegExp, str: string): RegExpExecArray[];
    static convertFromAnki(file: string): Promise<AnkiResult>;
}
export {};
