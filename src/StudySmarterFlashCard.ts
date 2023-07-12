import StudySmarterAccount from "./StudySmarterAccount";
import {FlashcardImage} from "./StudySmarterStudySet";
import Utils from "./Utils";

type htmlPart = {
    text: string,
    is_correct: boolean
}
export default class StudySmarterFlashCard{
    private readonly _account: StudySmarterAccount;
    private readonly _id: number;
    private readonly _original_studyset_id: number;
    private _question_html: htmlPart[];
    private _answer_html: htmlPart[];
    private _hint_html: string[];
    private _flashcard_images: FlashcardImage[];
    private _tags: number[];


    constructor(account: StudySmarterAccount, id: number, original_studyset_id: number, question_html: htmlPart[], answer_html: htmlPart[], hint_html: string[], flashcard_images: FlashcardImage[], tags: number[]) {
        Utils.checkParamsAreSet({account: account, id, original_studyset_id, question_html, answer_html, hint_html, flashcard_images, tags});

        this._account = account;
        this._id = id;
        this._original_studyset_id = original_studyset_id;
        this._question_html = question_html;
        this._answer_html = answer_html;
        this._hint_html = hint_html;
        this._flashcard_images = flashcard_images;
        this._tags = tags;
    }

    public static fromJSON(account: StudySmarterAccount, json: any) : StudySmarterFlashCard {
        return new StudySmarterFlashCard(account, json["id"], json["original_studyset_id"], json["question_html"], json["answer_html"], json["hint_html"], json["flashcard_images"], json["tags"]);
    }
}