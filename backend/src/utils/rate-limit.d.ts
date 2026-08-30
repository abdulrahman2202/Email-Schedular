export declare function getHourWindow(date?: Date): string;
export declare function getRateLimitKey(senderId: string, date?: Date): string;
export declare function checkAndIncrementRateLimit(senderId: string): Promise<boolean>;
export declare function getNextWindowDelay(): number;
//# sourceMappingURL=rate-limit.d.ts.map