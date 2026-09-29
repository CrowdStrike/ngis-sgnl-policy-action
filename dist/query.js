"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
class Query {
    token;
    domain;
    principalId;
    assetId;
    action;
    endpointUrl;
    constructor(token, domain, principalId, assetId, action) {
        this.token = token;
        this.domain = domain;
        this.principalId = principalId;
        this.assetId = assetId;
        this.action = action;
        if (!this.assetId && !this.action) {
            throw new Error("At least one of 'assetId' or 'action' is required.");
        }
        if (!this.principalId) {
            throw new Error('A principalId is required.');
        }
        this.endpointUrl = new URL('/continuous-identity/v1/access/evaluations', `https://${domain}`);
        if (this.endpointUrl.protocol !== 'https:') {
            throw new Error(`Invalid API endpoint from domain ${domain}. Endpoint must be https://`);
        }
    }
    headers() {
        return {
            Authorization: `Bearer ${this.token}`
        };
    }
    endpoint() {
        return this.endpointUrl.toString();
    }
    payload() {
        const _payload = {
            principal: null,
            queries: []
        };
        _payload.principal = { id: this.principalId };
        const q = {};
        if (this.assetId) {
            q.assetId = this.assetId;
        }
        if (this.action) {
            q.action = this.action;
        }
        _payload.queries.push(q);
        return _payload;
    }
}
exports.Query = Query;
//# sourceMappingURL=query.js.map