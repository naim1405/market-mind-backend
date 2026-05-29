import express from 'express';
import { webhookController } from './webhook.controller';
// import validateRequest from '../../middlewares/validateRequest';
// import { AuthController } from './auth.controller';
// import { AuthValidation } from './auth.validation';
// import auth from '../../middlewares/auth';
// import { UserRole } from '../../../generated/prisma/enums';

const router = express.Router();

router.post('/', (req, res) => {
    let body = req.body;
    console.log(`\u{1F7EA} Received webhook:`);
    console.dir(body, { depth: null });
    res.status(200).json({ message: 'Webhook received successfully' });
});

router.get('/', webhookController.verifyWebhook);

export const webhookRoutes = router;
