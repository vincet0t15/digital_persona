export interface Employee {
    id: number;
    name: string;
    username: string;
    office_id: number;
    image: string | null;
}

export interface EmployeeCreate {
    name: string;
    username: string;
    office_id: string;
    password: string;
    photo: File | null;
    fingerprint_template: string ;
    fingerprint_quality: number ;
    finger_name: string ;
}
