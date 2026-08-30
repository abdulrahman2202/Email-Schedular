interface GoogleTokenResponse {
    access_token: string;
    id_token: string;
    expires_in: number;
    token_type: string;
}
interface GoogleUserInfo {
    id: string;
    email: string;
    name: string;
    picture: string;
}
export declare function getGoogleAuthUrl(): string;
export declare function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse>;
export declare function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo>;
export declare function findOrCreateUser(googleUser: GoogleUserInfo): Promise<{
    name: string;
    id: string;
    googleId: string;
    email: string;
    avatar: string | null;
    createdAt: Date;
}>;
export declare function createJwtToken(user: {
    id: string;
    email: string;
}): string;
export {};
//# sourceMappingURL=auth.service.d.ts.map