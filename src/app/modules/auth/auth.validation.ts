import { z } from 'zod';

const loginZodSchema = z.object({
    body: z.object({
        email: z
            .string({
                message: 'Email is required',
            })
            .email('Please provide a valid email address'),
        password: z.string({
            message: 'Password is required',
        }),
    }),
});
const verifyZodSchema = z.object({
    body: z.object({
        otp: z.string({
            message: 'OTP is required',
        }),
    }),
});

const refreshTokenZodSchema = z.object({
    cookies: z.object({
        refreshToken: z.string({
            message: 'Refresh Token is required',
        }),
    }),
});

const changePasswordZodSchema = z.object({
    body: z.object({
        oldPassword: z.string({
            message: 'Old password  is required',
        }),
        newPassword: z.string({
            message: 'New password  is required',
        }),
    }),
});

export const AuthValidation = {
    loginZodSchema,
    verifyZodSchema,
    refreshTokenZodSchema,
    changePasswordZodSchema,
};
