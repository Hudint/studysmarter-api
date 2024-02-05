import StudySmarterAccount from "./StudySmarterAccount";
import StudySmarterStudySet, {FlashcardImage, ImageEntry} from "./StudySmarterStudySet";
import Utils from "./Utils";

type htmlPart = {
    text: string,
    is_correct: boolean
}

export enum FlashCardShareStatus {
    PRIVATE = 0,
    INVITED = 1,
    PUBLIC = 2
}

export default class StudySmarterFlashCard{
    private readonly _account: StudySmarterAccount;
    private readonly _set: StudySmarterStudySet;
    private readonly _id: number;
    private _question_html: htmlPart[];
    private _answer_html: htmlPart[];
    private _hint_html: string[];
    private _flashcard_images: FlashcardImage[];
    private _tags: number[];
    private _shared: FlashCardShareStatus;


    constructor(account: StudySmarterAccount, set: StudySmarterStudySet, id: number, question_html: htmlPart[], answer_html: htmlPart[], hint_html: string[], flashcard_images: FlashcardImage[], tags: number[], shared: FlashCardShareStatus) {
        Utils.checkParamsAreSet({account: account, set, id, question_html, answer_html, hint_html, flashcard_images, tags});

        this._account = account;
        this._set = set;
        this._id = id;
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

    get shared(): FlashCardShareStatus {
        return this._shared;
    }

    public selfOwned() : boolean{
        return true;
    }

    async modifyText(question: string, answer: string): Promise<void> {
        const images: ImageEntry[] = [];
        const uploadedImages: { [name: string]: FlashcardImage } = {};

        const replacedQuestion = await this._set.replaceImageTags(question, images, uploadedImages);
        const replacedAnswer = await this._set.replaceImageTags(answer, images, uploadedImages);

        return this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._set.id}/flashcards/${this._id}/`, {
            method: "PATCH",
            body: JSON.stringify({
                question_html: [{
                    text: replacedQuestion,
                    is_correct: true
                }],
                answer_html: [{
                    text: replacedAnswer,
                    is_correct: true
                }],
                flashcard_image_ids: Object.values(uploadedImages).map(i => i.id),
                hint_html: this._hint_html,
                tags: this._tags,

            })
        }).then(({question_html, answer_html, flashcard_images}) => {
            this._question_html = question_html;
            this._answer_html = answer_html;
            this._flashcard_images = flashcard_images;
        });
    }

    async modifyShare(shared: FlashCardShareStatus){
        return this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._set.id}/flashcards/${this._id}/`, {
            method: "PATCH",
            body: JSON.stringify({
                shared: shared
            })
        }).then(({shared}) => {
            this._shared = shared;
        });
    }

    public static fromJSON(account: StudySmarterAccount, set: StudySmarterStudySet, json: any) : StudySmarterFlashCard {
        return new StudySmarterFlashCard(account, set, json["id"], json["question_html"], json["answer_html"], json["hint_html"], json["flashcard_images"], json["tags"], json["shared"]);
    }
}
