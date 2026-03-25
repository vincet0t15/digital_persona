import { EmploymentType } from "./employmentType";
import { Office } from "./office";

export interface Employee {
    id: number;
    name: string;
    username: string;
    office_id: number;
    image: string | null;
    is_active: boolean;
    office: Office;
    employment_type: EmploymentType;
    fingerprints?: FingerprintData[];
}

export interface FingerprintData {
    template: string;
    quality: number;
    finger_name: string;
    samples?: FingerprintData[];
}

export interface EmployeeCreate {
    [key: string]: string | number | boolean | File | null;
    name: string;
    username?: string;
    office_id: string;
    employment_type_id: string;
    password?: string;
    photo: File | string | null;
    is_active: boolean;
    // fingerprints_json: string;
}
