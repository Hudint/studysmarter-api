import {decode} from "html-entities";
import StudySmarterAccount from "./StudySmarterAccount";
import Utils from "./Utils";
import StudySmarterFlashCard from "./StudySmarterFlashCard";

enum SetColor {
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
    "id": number,
    "image_string": string,
    "presigned_url": string,
    "image_file"?: any,
    "created": string,
    "image": string,
    "width": number,
    "deleted": boolean,
    "math_ml": string,
    "xfdfString"?: null,
    "localID": number,
    "flashcardinfo"?: number
}

export enum StudySmarterSearchOrder {
    smart = "smart",
    chronological = "chronological"
}
export type StudySmarterSearchParams = {
    searchText?: string,
    quantity?: number,
    order?: StudySmarterSearchOrder,
}

export type ImageEntry = {
    "name": string,
    "image_string"?: string,
    "image_blob"?: Blob
}


export default class StudySmarterStudySet {
    private readonly _account: StudySmarterAccount;
    private readonly _id: number;
    private readonly _creator_id?: number;
    private _name: string;
    private _color: SetColor;
    private _isShared: boolean;
    private _flashcard_count: number;
    private _created?: string;
    private _published_at?: string;
    private _last_used?: string;

    constructor(account: StudySmarterAccount, id: number, creator_id: number, name: string, color: SetColor, isShared: boolean, flashcard_count: number, created?: string, published_at?: string, last_used?: string) {
        Utils.checkParamsAreSet({account: account, id, name, color, isShared});
        this._account = account;
        this._id = id;
        this._creator_id = creator_id;
        this._name = name;
        this._color = color;
        this._isShared = isShared;
        this._flashcard_count = flashcard_count;
        this._created = created;
        this._published_at = published_at;
        this._last_used = last_used;
    }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get color(): SetColor {
        return this._color;
    }

    get creator_id(): number {
        return this._creator_id;
    }

    get isShared(): boolean {
        return this._isShared;
    }

    get flashcard_count(): number {
        return this._flashcard_count;
    }

    get published_at(): string {
        return this._published_at;
    }

    get created(): string {
        return this._created;
    }

    get last_used(): string {
        return this._last_used;
    }

    getFlashCards(params?: StudySmarterSearchParams) : Promise<StudySmarterFlashCard[]> {
        return this._account.fetchJson(
            `https://prod.studysmarter.de/studysets/${this._id}/flashcards/?search=${Utils.encodeURLNullable(params?.searchText)}&s_bad=true&s_medium=true&s_good=true&s_trash=false&s_unseen=true&tag_ids=&quantity=${params?.quantity ? encodeURIComponent(params?.quantity) : "999999"}&created_by=&order=${params?.order ? encodeURIComponent(params?.quantity) : StudySmarterSearchOrder.chronological}`, {
            method: "GET"
        }).then(({results}) => results.map(card => {
            return StudySmarterFlashCard.fromJSON(this._account, this, card)
        }))
    }

    async delete() {
        return this._account.fetch(`https://prod.studysmarter.de/studysets/${this._id}/`, {
            method: "DELETE"
        })
    }

    modify(name?: string, color?: SetColor, isPublic?: boolean) {
        console.log(name, color, isPublic)
        return this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._id}/`, {
            method: "PATCH",
            body: JSON.stringify({
                colorId: color ?? this._color,
                shared: isPublic ?? this._isShared,
                name: name ?? this._name
            })
        }).then(({name, colorId, shared}) => {
            this._name = name;
            this._color = colorId;
            this._isShared = shared;
        })
    }

    async addFlashCardClone(card: StudySmarterFlashCard) {
        // const images: ImageEntry[] = [];
        // console.log(card)
        // for (const image of card.flashcard_images) {
        //     console.log(image)
        //     const imageBlob = await (await this._account.fetch(image.presigned_url, {})).blob();
        //     images.push({
        //         name: image.presigned_url,
        //         image_blob: imageBlob
        //     })
        // }
        return this.addFlashCard(card.question, card.answer, []);
    }

    async addFlashCard(question: string, answer: string, images: ImageEntry[] = []) {
        let uploadedImages: { [name: string]: FlashcardImage } = {};

        const questionWithImages = await this.replaceImageTags(question, images, uploadedImages);
        const answerWithImages = await this.replaceImageTags(answer, images, uploadedImages);

        return this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._id}/flashcards/`, {
            method: "POST",
            body: JSON.stringify({
                "flashcard_image_ids": Object.values(uploadedImages).map(i => i.id),
                "tags": [],
                "question_html": [{
                    text: questionWithImages,
                    is_correct: true
                }],
                "answer_html": [{
                    text: answerWithImages,
                    is_correct: true
                }],
                "shared": 2,
                "hint_html": [],
                "solution_html": ""
            })
        }).then(() => this._flashcard_count++)
    }

    async replaceImageTags(text: string, images: ImageEntry[], uploadedImages: {
        [name: string]: FlashcardImage
    }) {
        let result = text;

        for (const [full, src] of Utils.regexExecArray(/<img[^s>]*src="([^"]+)"[^>]*>/g, text)) {
            if(src.startsWith("http")){
                images.push({
                    name: src,
                    image_blob: await (await fetch(decode(src), {method: "GET"})).blob()
                })
            }
            const imageEntry = images.find(i => i.name === src);
            if(!imageEntry) {
                console.log("Image not found", src);
                continue;
            }
            const uploaded = uploadedImages[imageEntry.name] || await this.uploadImage(imageEntry);
            uploadedImages[imageEntry.name] = uploaded;
            result = result.replace(new RegExp(`<img[^s>]*src=\"${Utils.escapeRegExp(src)}\"[^>]*>`, "g"), `<img localid="${uploaded.localID}" width="${uploaded.width}" class="fr-fic fr-dii">`)
        }
        return result;
    }

    private async uploadImage(image: ImageEntry): Promise<FlashcardImage> {
        const body = new FormData();
        body.append("image_file", image.image_blob ?? await fetch(image.image_string).then(r => r.blob()));
        body.append("localID", "" + Date.now());
        return await this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._id}/images/`, {
            method: "POST",
            body
        }, false)
    }

    public static fromJSON(account: StudySmarterAccount, json: any): StudySmarterStudySet {
        return new StudySmarterStudySet(
            account,
            json.id,
            json.creator_id,
            json.name,
            json.colorId,
            json.shared,
            json.flashcard_count,
            Utils.nullableDateFormat(json.created),
            Utils.nullableDateFormat(json.published_at),
            Utils.nullableDateFormat(json.last_used)
        )
    }
}

export type {FlashcardImage}
export {SetColor}
