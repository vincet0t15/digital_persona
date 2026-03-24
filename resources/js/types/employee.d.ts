export interface Employee {
    id: number;
    name: string;
    username: string;
    office_id: number;
    image: string | null;
}

export interface EmployeeCreate {
    [key: string]: string | number | File | null;
    name: string;
    username: string;
    office_id: string;
    password: string;
    photo: File | string | null;
    fingerprint_template: string;
    fingerprint_quality: number | string;
    finger_name: string;
}
