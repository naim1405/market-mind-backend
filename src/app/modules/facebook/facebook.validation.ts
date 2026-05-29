import { z } from 'zod';

export const FacebookPageSchema = z.object({
    id: z.string(),
    name: z.string(),
    access_token: z.string(),
});

export const FacebookAccountsSchema = z.object({
    data: z.array(FacebookPageSchema),
    paging: z
        .object({
            cursors: z.object({
                before: z.string(),
                after: z.string(),
            }),
        })
        .optional(),
});

export const FacebookUserSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
    email: z.email().optional(),
    accounts: FacebookAccountsSchema.optional(),
});

export const FacebookCodeVerifyResponseSchema = z.object({
    access_token: z.string(),
    token_type: z.string(),
    expires_in: z.number(),
});
