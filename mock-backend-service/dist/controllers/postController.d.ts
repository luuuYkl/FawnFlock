import { Request, Response } from 'express';
export declare const getPosts: (req: Request, res: Response) => void;
export declare const getPostById: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
export declare const createPost: (req: Request, res: Response) => void;
export declare const likePost: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
export declare const unlikePost: (req: Request, res: Response) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=postController.d.ts.map