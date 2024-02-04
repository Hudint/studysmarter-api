import StudySmarterAccount from "./StudySmarterAccount";
import StudySmarterStudySet, { FlashcardImage } from "./StudySmarterStudySet";
type htmlPart = {
    text: string;
    is_correct: boolean;
};
declare enum FlashCardShareStatus {
    PRIVATE = 0,
    INVITED = 1,
    PUBLIC = 2
}
export default class StudySmarterFlashCard {
    private readonly _account;
    private readonly _set;
    private readonly _id;
    private _question_html;
    private _answer_html;
    private _hint_html;
    private _flashcard_images;
    private _tags;
    private _shared;
    constructor(account: StudySmarterAccount, set: StudySmarterStudySet, id: number, question_html: htmlPart[], answer_html: htmlPart[], hint_html: string[], flashcard_images: FlashcardImage[], tags: number[], shared: FlashCardShareStatus);
    get id(): number;
    get question_html(): htmlPart[];
    get answer_html(): htmlPart[];
    get hint_html(): string[];
    get question(): string;
    get answer(): string;
    get flashcard_images(): FlashcardImage[];
    get tags(): number[];
    modifyText(question: string, answer: string): Promise<void>;
    static fromJSON(account: StudySmarterAccount, set: StudySmarterStudySet, json: any): StudySmarterFlashCard;
}
export {};
