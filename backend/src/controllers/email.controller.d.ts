import { Request, Response } from "express";
export declare function scheduleEmailsController(req: Request, res: Response): Promise<void>;
export declare function getScheduledEmails(req: Request, res: Response): Promise<void>;
export declare function getSentEmails(req: Request, res: Response): Promise<void>;
export declare function getEmailById(req: Request<{
    id: string;
}>, res: Response): Promise<void>;
//# sourceMappingURL=email.controller.d.ts.map