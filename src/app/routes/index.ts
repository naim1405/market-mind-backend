import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { webhookRoutes } from '../modules/webhook/webhook.routes';

const router = express.Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: AuthRoutes,
    },
    {
        path: '/webhook',
        route: webhookRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
