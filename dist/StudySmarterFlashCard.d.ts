import StudySmarterAccount from "./StudySmarterAccount";
import { FlashcardImage } from "./StudySmarterStudySet";
declare type htmlPart = {
    text: string;
    is_correct: boolean;
};
export default class StudySmarterFlashCard {
    private readonly _account;
    private readonly _id;
    private readonly _original_studyset_id;
    private _question_html;
    private _answer_html;
    private _hint_html;
    private _flashcard_images;
    private _tags;
    constructor(account: StudySmarterAccount, id: number, original_studyset_id: number, question_html: htmlPart[], answer_html: htmlPart[], hint_html: string[], flashcard_images: FlashcardImage[], tags: number[]);
    static fromJSON(account: StudySmarterAccount, json: any): StudySmarterFlashCard;
}
export {};
