export declare function getSlackAuthUrl(): string;
export declare function exchangeSlackCode(code: string): Promise<{
    accessToken: string;
    teamId: string;
}>;
export declare function saveSlackConnection(userId: string, accessToken: string, teamId: string): Promise<void>;
export declare function getSlackStatus(userId: string): Promise<{
    connected: boolean;
    teamId: string | null;
}>;
export declare function disconnectSlack(userId: string): Promise<void>;
export declare function sendSlackNotification(userId: string, message: string): Promise<void>;
//# sourceMappingURL=slack.service.d.ts.map