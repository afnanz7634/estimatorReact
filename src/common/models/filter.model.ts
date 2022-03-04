export interface FilterOption {
    name: string;
    numberOfItems: number;
    isSelected: boolean;
}

export interface Filter {
    isExpanded: boolean;
    filterOption: FilterOption[];
}