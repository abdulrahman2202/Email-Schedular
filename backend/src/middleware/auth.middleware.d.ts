import { Request, Response, NextFunction } from "express";
export interface AuthUser {
    userId: string;
    email: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
export declare function authenticate(req: Request, res: Response, next: NextFunction): void;
export declare function signToken(payload: AuthUser): string;
//# sourceMappingURL=auth.middleware.d.ts.map