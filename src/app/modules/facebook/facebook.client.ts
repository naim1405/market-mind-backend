import config from '../../../config/index';
import {
    FacebookUserSchema,
    FacebookPageSchema,
    FacebookAccountsSchema,
    FacebookCodeVerifyResponseSchema,
} from './facebook.validation';

const GRAPH_API_BASE = 'https://graph.facebook.com/v25.0';

/**
 * Shared internal fetch wrapper for all Graph API calls
 */
async function graphFetch<T>(
    url: string,
    schema: {
        parse: (data: unknown) => T;
    }
): Promise<T> {
    const res = await fetch(url);

    const raw: unknown = await res.json();

    // Handle HTTP-level errors
    if (!res.ok) {
        throw new Error(`Facebook Graph API error: ${JSON.stringify(raw)}`);
    }

    // Validate runtime shape
    return schema.parse(raw);
}

/**
 * Get logged-in Facebook user (profile + pages)
 */
export function getMe(accessToken: string) {
    const fields = ['id', 'name', 'email', 'accounts'].join(',');

    return graphFetch(
        `${GRAPH_API_BASE}/me?fields=${fields}&access_token=${accessToken}`,
        FacebookUserSchema
    );
}

/**
 * Get only pages connected to the user
 */
export function getPages(accessToken: string) {
    const fields = 'accounts{ id,name,access_token }';

    return graphFetch(
        `${GRAPH_API_BASE}/me?fields=${fields}&access_token=${accessToken}`,
        FacebookAccountsSchema
    );
}

/**
 * Get a single page details (if needed separately)
 */
export function getPage(pageId: string, accessToken: string) {
    const fields = ['id', 'name', 'access_token'].join(',');

    return graphFetch(
        `${GRAPH_API_BASE}/${pageId}?fields=${fields}&access_token=${accessToken}`,
        FacebookPageSchema
    );
}

export function verifyCode(code: string) {
    const fetchUrl = `https://graph.facebook.com/v25.0/oauth/access_token?client_id=${config.meta.app_id}&redirect_uri=${config.meta.redirect_uri}&client_secret=${config.meta.app_secret}&code=${code}`;
    return graphFetch(fetchUrl, FacebookCodeVerifyResponseSchema);
}

export async function subscribeToPage(pageId: string, pageAccessToken: string) {
    const subscribedFields = ['messages', 'messaging_postbacks'].join(',');
    const res = await fetch(
        `https://graph.facebook.com/v25.0/${pageId}/subscribed_apps?access_token=${pageAccessToken}&subscribed_fields=${subscribedFields}`,
        {
            method: 'POST',
        }
    );
    const resJson = await res.json();
    if (resJson?.success) {
        return true;
    }
    return false;
}

export const facebookClient = {
    getMe,
    getPage,
    getPages,
    verifyCode,
    subscribeToPage,
};
