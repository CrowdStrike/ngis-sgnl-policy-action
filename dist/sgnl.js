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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sgnl = sgnl;
const axios_1 = __importDefault(require("axios"));
const core = __importStar(require("@actions/core"));
async function sgnl(query) {
    const response = await axios_1.default.post(query.endpoint(), query.payload(), { headers: query.headers() });
    core.debug(`SGNL API returned:\n${JSON.stringify(response.data, null, 2)}`);
    return parse(response.data);
}
function parse(data) {
    const decisions = data.decisions;
    if (decisions?.length !== 1) {
        throw new Error(`SGNL API returned ${decisions?.length ?? 0} decisions, expected exactly 1`);
    }
    return {
        decision: decisions[0].decision === 'Allow',
        reason: decisions[0].reasons ? decisions[0].reasons[0] : ''
    };
}
//# sourceMappingURL=sgnl.js.map