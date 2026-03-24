import type { PageProps as InertiaPageProps } from '@inertiajs/core';

export interface FilterProps {
    search?: string;
    office_id?: string;
    [key: string]: any;

}

interface MyPageProps extends InertiaPageProps {
    filters: FilterProps;
}
