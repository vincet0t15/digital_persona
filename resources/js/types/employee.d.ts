import { Office } from "./office";

export interface Employee {
    id: number;
    name: string;
    username: string;
    office_id: number;
    image: string | null;
    office: Office
}

export interface FingerprintData {
    template: string;
    quality: number;
    finger_name: string;
    samples?: FingerprintData[];
}

export interface EmployeeCreate {
    [key: string]: string | number | File | null;
    name: string;
    username: string;
    office_id: string;
    password: string;
    photo: File | string | null;
    fingerprints_json: string;
}
