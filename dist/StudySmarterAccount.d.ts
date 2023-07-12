import StudySmarterStudySet, { SetColor } from "./StudySmarterStudySet";
export default class StudySmarterAccount {
    private readonly _id;
    private readonly _token;
    constructor(id: number, token: string);
    get id(): number;
    get token(): string;
    fetch(url: string, RequestInit: RequestInit, contentType?: string): Promise<any>;
    changePassword(newPassword: string): Promise<any>;
    createStudySet(name: string, color: SetColor, isPublic: boolean): Promise<any>;
    getStudySets(): Promise<StudySmarterStudySet[]>;
    private static resCodeCheck;
    static fromEmailAndPassword(email: string, password: string): Promise<StudySmarterAccount>;
}
