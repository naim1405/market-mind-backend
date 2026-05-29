import { type Request, type Response } from 'express';
import catchAsync from '../../../lib/catchAsync';
import sendResponse from '../../../lib/sendResponse';
// import { webhookService } from './webhook.service';
// import type { JWTPayload } from '../../../interface';
// import config from '../../../config/index';
// import ApiError from '../../../errors/ApiError';
// import httpStatus from '../../../const/httpStatus';
import config from '../../../config/index';

const verifyWebhook = catchAsync(async (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = config.meta.webhook_verify_token;
    if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('🗼 WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            // Respond with '403 Forbidden' if verify tokens do not match
            sendResponse(res, {
                statusCode: 403,
                success: false,
                message: 'Webhook Verification is unsuccessful.',
            });
        }
    }
    sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Invalid Webhook Verification request.',
    });
});

export const webhookController = { verifyWebhook };
