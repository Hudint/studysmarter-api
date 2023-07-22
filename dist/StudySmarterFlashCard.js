"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("./Utils");
var FlashCardShareStatus;
(function (FlashCardShareStatus) {
    FlashCardShareStatus[FlashCardShareStatus["PRIVATE"] = 0] = "PRIVATE";
    FlashCardShareStatus[FlashCardShareStatus["INVITED"] = 1] = "INVITED";
    FlashCardShareStatus[FlashCardShareStatus["PUBLIC"] = 2] = "PUBLIC";
})(FlashCardShareStatus || (FlashCardShareStatus = {}));
class StudySmarterFlashCard {
    constructor(account, id, original_studyset_id, question_html, answer_html, hint_html, flashcard_images, tags, shared) {
        Utils_1.default.checkParamsAreSet({ account: account, id, original_studyset_id, question_html, answer_html, hint_html, flashcard_images, tags });
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
    get id() {
        return this._id;
    }
    get original_studyset_id() {
        return this._original_studyset_id;
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
    get flashcard_images() {
        return this._flashcard_images;
    }
    get tags() {
        return this._tags;
    }
    async modifyText(question, answer) {
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
        }).then(({ question_html, answer_html }) => {
            this._question_html = question_html;
            this._answer_html = answer_html;
        });
    }
    static fromJSON(account, json) {
        return new StudySmarterFlashCard(account, json["id"], json["original_studyset_id"], json["question_html"], json["answer_html"], json["hint_html"], json["flashcard_images"], json["tags"], json["shared"]);
    }
}
exports.default = StudySmarterFlashCard;
