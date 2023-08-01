import StudySmarterAccount from "./StudySmarterAccount";
import {FlashcardImage, ImageEntry} from "./StudySmarterStudySet";
import Utils from "./Utils";

type htmlPart = {
    text: string,
    is_correct: boolean
}

enum FlashCardShareStatus {
    PRIVATE = 0,
    INVITED = 1,
    PUBLIC = 2
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
    private _shared: FlashCardShareStatus;


    constructor(account: StudySmarterAccount, id: number, original_studyset_id: number, question_html: htmlPart[], answer_html: htmlPart[], hint_html: string[], flashcard_images: FlashcardImage[], tags: number[], shared: FlashCardShareStatus) {
        Utils.checkParamsAreSet({account: account, id, original_studyset_id, question_html, answer_html, hint_html, flashcard_images, tags});

        this._account = account;
        this._id = id;
        this._original_studyset_id = original_studyset_id;
        this._question_html = question_html;
        this._answer_html = answer_html;
        this._hint_html = hint_html;
        this._flashcard_images = flashcard_images;
        this._tags = tags;
        this._shared = shared;
    }


    get id(): number {
        return this._id;
    }

    get original_studyset_id(): number {
        return this._original_studyset_id;
    }

    get question_html(): htmlPart[] {
        return this._question_html;
    }

    get answer_html(): htmlPart[] {
        return this._answer_html;
    }

    get hint_html(): string[] {
        return this._hint_html;
    }

    get question(): string {
        return this._question_html.map(part => part.text).join("");
    }
    get answer(): string {
        return this._answer_html.filter(p => p.is_correct).map(part => part.text).join("");
    }

    get flashcard_images(): FlashcardImage[] {
        return this._flashcard_images;
    }

    get tags(): number[] {
        return this._tags;
    }

    async modifyText(question: string, answer: string): Promise<void> {
        this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._original_studyset_id}/flashcards/${this._id}/`, {
            method: "PATCH",
            body: JSON.stringify({
                question_html: [{
                    text: question,
                    is_correct: true
                }],
                answer_html: [{
                    text: answer,
                    is_correct: true
                }],
                flashcard_image_ids: this._flashcard_images.map(i => i.id),
                hint_html: this._hint_html,
                tags: this._tags,

            })
        }).then(({question_html, answer_html}) => {
            this._question_html = question_html;
            this._answer_html = answer_html;
        });
    }

    public static fromJSON(account: StudySmarterAccount, json: any) : StudySmarterFlashCard {
        return new StudySmarterFlashCard(account, json["id"], json["original_studyset_id"], json["question_html"], json["answer_html"], json["hint_html"], json["flashcard_images"], json["tags"], json["shared"]);
    }
}