export interface SessionData {
    user: {
        id: number;
        role: string;
    };
    expires: string;
}
export declare function signToken(payload: SessionData): Promise<string>;
export declare function verifyToken(input: string): Promise<SessionData>;
//# sourceMappingURL=index.d.ts.map