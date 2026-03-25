import { Shift } from './shift';

export interface EmploymentType {
    id: number;
    name: string;
    description: string;
    status: boolean;
    shift_id: number | null;
    shift?: Shift;
}

export interface EmploymentTypeForm {
    name: string;
    description: string;
    status: boolean;
    shift_id: number | null;
    [key: string]: any;
}
