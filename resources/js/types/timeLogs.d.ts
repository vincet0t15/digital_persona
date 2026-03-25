export interface TimeLog {
    id: number;
    employee_id: number;
    log_type: 'IN' | 'OUT';
    date_time: string;
    is_late?: boolean;
    late_minutes?: number;
    is_undertime?: boolean;
    undertime_minutes?: number;
}
