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
};
export default class Utils {
    private constructor();
    static checkParamsAreSet(params: any): void;
    static regexExecArray(regex: RegExp, str: string): RegExpExecArray[];
    static convertFromAnki(file: string): Promise<AnkiResult>;
}
export {};
