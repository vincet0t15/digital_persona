export interface LinkProps {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedDataResponse<dataFromdatabase> {
    current_page: number;
    from: number;
    to: number;
    last_page: number;
    path: string;
    per_page: number;
    total: number;

    links: LinkProps[];
    data: dataFromdatabase[];
}

export interface PaginationData {
    search: string;
    meta: MetaProps;
}
