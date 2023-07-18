import StudySmarterAccount from "./StudySmarterAccount";
declare enum SetColor {
    Red = 0,
    Blue = 1,
    Mint = 2,
    Purple = 3,
    Teal = 4,
    Orange = 5,
    Green = 6,
    Violet = 7
}
type FlashcardImage = {
    "id": number;
    "image_string": string;
    "presigned_url": string;
    "image_file"?: any;
    "created": string;
    "image": string;
    "width": number;
    "deleted": boolean;
    "math_ml": string;
    "xfdfString"?: null;
    "localID": number;
    "flashcardinfo"?: number;
};
type ImageEntry = {
    "name": string;
    "image_string"?: string;
    "image_file"?: Blob;
};
export default class StudySmarterStudySet {
    private readonly _account;
    private readonly _id;
    private readonly _creator_id;
    private _name;
    private _color;
    private _isShared;
    constructor(account: StudySmarterAccount, id: number, name: string, color: SetColor, creator_id: number, isShared: boolean);
    get id(): number;
    get name(): string;
    get color(): SetColor;
    get creator_id(): number;
    get isShared(): boolean;
    getFlashCards(): Promise<any>;
    delete(): Promise<Response>;
    modify(name?: string, color?: SetColor, isPublic?: boolean): Promise<void>;
    addFlashCard(question: string, answer: string, images?: ImageEntry[]): Promise<any>;
    private replaceImageTags;
    private uploadImage;
    static fromJSON(account: StudySmarterAccount, json: any): StudySmarterStudySet;
}
export type { FlashcardImage };
export { SetColor };
