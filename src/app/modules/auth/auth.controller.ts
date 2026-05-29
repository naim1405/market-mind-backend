import { type Request, type Response } from 'express';

import { AuthService } from './auth.service';
import { AuthCookie } from '../../../helpers/authCookies';
import catchAsync from '../../../lib/catchAsync';
import sendResponse from '../../../lib/sendResponse';
import type { JWTPayload } from '../../../interface';

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.loginUser(req);
    AuthCookie.setAuthCookies(res, result.access, result.refresh);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Login is successful.',
        data: result.user,
    });
});

const getTokenForTest = catchAsync(async (_req: Request, res: Response) => {
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Your token',
        data: 'result',
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    await AuthService.changePassword(req);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Password changed successfully!',
        data: {
            message: 'Password changed successfully!',
        },
    });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await AuthService.getMe(user as JWTPayload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Password changed successfully!',
        data: result,
    });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
    await AuthService.logout(req);
    AuthCookie.removeAuthCookies(res);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Logout is successful.',
        data: {
            message: 'Logout is successful',
        },
    });
});

const loginUserByFacebook = catchAsync(async (req: Request, res: Response) => {
    const sessionId = crypto.randomUUID();
    const state = crypto.randomUUID();
    // Store the sessionId and state in your database or cache for later verification
    const redirectUrl = `https://www.facebook.com/v25.0/dialog/oauth?client_id=${config.meta.app_id}&redirect_uri=${config.meta.redirect_uri}&state=${state}&config_id=${config.meta.config_id}`;

    res.redirect(redirectUrl);
});
const facebookCallback = catchAsync(async (req: Request, res: Response) => {
    const { code, error = null } = req.query;
    if (error) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Facebook authentication failed'
        );
    }

    if (!code) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Authorization code is missing'
        );
    }

    //TODO: do state check

    const result = await AuthService.handleFacebookCallback(
        req,
        code as string
    );
    AuthCookie.setAuthCookies(res, result.access, result.refresh);
    res.redirect(config.frontend_url as string);
});
export const AuthController = {
    loginUserByFacebook,
    loginUser,
    getTokenForTest,
    changePassword,
    getMe,
    logoutUser,
    facebookCallback,
};
