"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = getAccessToken;
const axios_1 = __importDefault(require("axios"));
async function getAccessToken({ clientId, clientSecret, tokenUrl }) {
    if (!clientId)
        throw new Error('clientId is required');
    if (!clientSecret)
        throw new Error('clientSecret is required');
    if (!tokenUrl)
        throw new Error('tokenUrl is required');
    const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
    });
    const response = await axios_1.default.post(tokenUrl, params);
    if (!response.data.access_token) {
        throw new Error('OAuth2 token response missing access_token');
    }
    return response.data.access_token;
}
//# sourceMappingURL=auth.js.map