import { Query } from './query';
export interface SgnlResult {
    decision: boolean;
    reason: string;
}
export declare function sgnl(query: Query): Promise<SgnlResult>;
//# sourceMappingURL=sgnl.d.ts.map