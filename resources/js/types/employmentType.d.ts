export interface EmploymentType {
    id: number;
    name: string;
    description: string;
    status: boolean;
}

export interface EmploymentTypeForm {
    name: string;
    description: string;
    status: boolean;
    [key: string]: any;
}
