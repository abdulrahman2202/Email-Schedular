import { Request, Response } from "express";
export declare function slackConnect(_req: Request, res: Response): void;
export declare function slackCallback(req: Request, res: Response): Promise<void>;
export declare function slackStatus(req: Request, res: Response): Promise<void>;
export declare function slackDisconnect(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=slack.controller.d.ts.map