import { z } from 'zod';
import {
    FacebookCodeVerifyResponseSchema,
    FacebookUserSchema,
} from './facebook.validation';

export type FacebookUser = z.infer<typeof FacebookUserSchema>;
export type FacebookCodeVerifyResponse = z.infer<
    typeof FacebookCodeVerifyResponseSchema
>;
