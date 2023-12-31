import StudySmarterStudySet, { SetColor } from "./StudySmarterStudySet";
export default class StudySmarterAccount {
    private readonly _id;
    private readonly _token;
    constructor(id: number, token: string);
    get id(): number;
    get token(): string;
    fetchJson(url: string, RequestInit: RequestInit, setContentType?: boolean): any;
    fetch(url: string, RequestInit: RequestInit, setContentType?: boolean): any;
    changePassword(newPassword: string): any;
    createStudySet(name: string, color: SetColor, isPublic: boolean): any;
    getStudySets(verbose?: boolean): Promise<StudySmarterStudySet[]>;
    private static validateResponse;
    static fromEmailAndPassword(email: string, password: string): Promise<StudySmarterAccount>;
}
