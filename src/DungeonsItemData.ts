export type ProbabilitySpecifier = number;

export interface DungeonsItemData {
    name: string;
    mainChest: ProbabilitySpecifier;
    otherChests: ProbabilitySpecifier;
    fillScore: number | null;
    color: string
};
