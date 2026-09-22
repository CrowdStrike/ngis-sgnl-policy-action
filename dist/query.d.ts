export interface QueryPayload {
    principal: {
        id: string;
    } | null;
    queries: {
        assetId?: string;
        action?: string;
    }[];
}
export declare class Query {
    token: string;
    domain: string;
    principalId: string;
    assetId: string;
    action: string;
    endpointUrl: URL;
    constructor(token: string, domain: string, principalId: string, assetId: string, action: string);
    headers(): Record<string, string>;
    endpoint(): string;
    payload(): QueryPayload;
}
//# sourceMappingURL=query.d.ts.map