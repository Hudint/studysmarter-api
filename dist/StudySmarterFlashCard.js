"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashCardShareStatus = void 0;
const Utils_1 = require("./Utils");
var FlashCardShareStatus;
(function (FlashCardShareStatus) {
    FlashCardShareStatus[FlashCardShareStatus["PRIVATE"] = 0] = "PRIVATE";
    FlashCardShareStatus[FlashCardShareStatus["INVITED"] = 1] = "INVITED";
    FlashCardShareStatus[FlashCardShareStatus["PUBLIC"] = 2] = "PUBLIC";
})(FlashCardShareStatus || (exports.FlashCardShareStatus = FlashCardShareStatus = {}));
class StudySmarterFlashCard {
    constructor(account, set, id, question_html, answer_html, hint_html, flashcard_images, tags, shared) {
        Utils_1.default.checkParamsAreSet({ account: account, set, id, question_html, answer_html, hint_html, flashcard_images, tags });
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
    get id() {
        return this._id;
    }
    get question_html() {
        return this._question_html;
    }
    get answer_html() {
        return this._answer_html;
    }
    get hint_html() {
        return this._hint_html;
    }
    get question() {
        return this._question_html.map(part => part.text).join("");
    }
    get answer() {
        return this._answer_html.filter(p => p.is_correct).map(part => part.text).join("");
    }
    get flashcard_images() {
        return this._flashcard_images;
    }
    get tags() {
        return this._tags;
    }
    get shared() {
        return this._shared;
    }
    selfOwned() {
        return true;
    }
    async modifyText(question, answer) {
        const images = [];
        const uploadedImages = {};
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
        }).then(({ question_html, answer_html, flashcard_images }) => {
            this._question_html = question_html;
            this._answer_html = answer_html;
            this._flashcard_images = flashcard_images;
        });
    }
    async modifyShare(shared) {
        return this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._set.id}/flashcards/${this._id}/`, {
            method: "PATCH",
            body: JSON.stringify({
                shared: shared
            })
        }).then(({ shared }) => {
            this._shared = shared;
        });
    }
    static fromJSON(account, set, json) {
        return new StudySmarterFlashCard(account, set, json["id"], json["question_html"], json["answer_html"], json["hint_html"], json["flashcard_images"], json["tags"], json["shared"]);
    }
}
exports.default = StudySmarterFlashCard;
