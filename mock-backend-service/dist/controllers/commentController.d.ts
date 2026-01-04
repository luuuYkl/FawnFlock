import { Request, Response } from 'express';
export declare const getCommentsByPostId: (req: Request, res: Response) => void;
export declare const createComment: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
export declare const deleteComment: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=commentController.d.ts.map