export interface TimeLog {
    id: number;
    employee_id: number;
    log_type: 'IN' | 'OUT';
    date_time: string;
}
