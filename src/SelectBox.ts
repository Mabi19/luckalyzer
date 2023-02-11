export type BaseOption = {
    id: string,
    label: string,
    color?: string,
};

export type OptionGroup = {
    name: string,
    options: BaseOption[],
}

export interface PaddedOptionGroup {
    name: string,
    options: (BaseOption | { empty: number })[],
}

export type Option = BaseOption | OptionGroup;
