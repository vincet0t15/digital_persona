export interface Employee {
    id: number;
    name: string;
    username: string;
    office_id: number;
    image: string | null;
}

export type EmployeeCreate = Omit<Employee, 'id','image'> & {
    photo: File | null;
};;
