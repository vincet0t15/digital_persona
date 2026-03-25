export interface Shift {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    break_start: string | null;
    break_end: string | null;
    grace_minutes: number;
    is_active: boolean;
    employment_types_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface ShiftFormData {
    [key: string]: string | number | boolean | null;
    name: string;
    start_time: string;
    end_time: string;
    break_start: string | null;
    break_end: string | null;
    grace_minutes: number;
    is_active: boolean;
}
