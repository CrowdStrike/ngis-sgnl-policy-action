"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const core = __importStar(require("@actions/core"));
const sgnl_1 = require("./sgnl");
const query_1 = require("./query");
const auth_1 = require("./auth");
async function run() {
    if (core.getInput('bypassMode') === 'true') {
        core.warning('*** WARNING: BYPASS MODE ENABLED ***');
        core.warning('*** Skipping SGNL Policy Checks ***');
        core.setOutput('reason', 'Skipping SGNL call due to bypassMode=true');
        core.setOutput('decision', true);
        return;
    }
    const clientId = core.getInput('client_id');
    const clientSecret = core.getInput('client_secret');
    const domain = core.getInput('domain');
    core.setSecret(clientSecret);
    const tokenUrl = `https://${domain}/oauth2/token`;
    let accessToken;
    try {
        accessToken = await (0, auth_1.getAccessToken)({ clientId, clientSecret, tokenUrl });
    }
    catch (error) {
        core.setFailed(`Failed to obtain OAuth2 access token: ${error instanceof Error ? error.message : String(error)}`);
        return;
    }
    core.setSecret(accessToken);
    try {
        const query = new query_1.Query(accessToken, domain, core.getInput('principalId'), core.getInput('assetId'), core.getInput('action'));
        core.debug(`Querying SGNL accessEvaluation API. Query is:\n${JSON.stringify(query.payload(), null, 2)}`);
        const result = await (0, sgnl_1.sgnl)(query);
        core.setOutput('reason', result.reason);
        core.setOutput('decision', result.decision);
        if (!result.decision) {
            core.setFailed(result.reason);
        }
    }
    catch (error) {
        core.warning('SGNL API request failed');
        if (error != null &&
            typeof error === 'object' &&
            'response' in error &&
            error.response != null &&
            typeof error.response === 'object' &&
            'status' in error.response) {
            core.setFailed(`SGNL API request failed with status ${error.response.status}`);
        }
        else if (error != null &&
            typeof error === 'object' &&
            'request' in error) {
            core.setFailed('SGNL API did not respond');
        }
        else if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed('Unknown error');
        }
    }
}
//# sourceMappingURL=main.js.map