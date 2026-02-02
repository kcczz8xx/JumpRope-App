import { ReactNode } from "react";

export interface DataTableColumn<T = unknown> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (row: T) => ReactNode;
    width?: string;
    align?: "left" | "center" | "right";
}

export interface DataTableAction {
    label: string;
    variant?: "primary" | "outline";
    icon?: ReactNode;
    onClick?: () => void;
    href?: string;
}

export interface DataTableFilter {
    key: string;
    label: string;
    type: "text" | "select";
    options?: { label: string; value: string }[];
    placeholder?: string;
}

export interface DataTableProps<T = unknown> {
    title?: string;
    description?: string;
    columns: DataTableColumn<T>[];
    data: T[];
    actions?: DataTableAction[];
    filters?: DataTableFilter[];
    searchable?: boolean;
    searchPlaceholder?: string;
    searchKeys?: string[];
    selectable?: boolean;
    onSelectionChange?: (selectedIds: string[]) => void;
    getRowId?: (row: T) => string;
    pagination?: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
    showPageSizeSelector?: boolean;
    emptyMessage?: string;
    emptyAction?: {
        label: string;
        onClick?: () => void;
        href?: string;
    };
}

export interface SortState {
    key: string;
    asc: boolean;
}
