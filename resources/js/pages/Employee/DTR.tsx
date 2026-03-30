import { EmployeeHeader } from '@/components/EmployeeHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import { Head, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import { Clock, FileText, Printer, RotateCcw } from 'lucide-react';
import { useState } from 'react';

type DTRRecord = {
    date: string;
    am_in: string;
    am_out: string;
    pm_in: string;
    pm_out: string;
    late_minutes: number;
    total_hours: number;
};

type DTRData = {
    student_id: string;
    student_name: string;
    records: DTRRecord[];
    forTheMonthOf: string;
    totalIn: number;
    totalOut: number;
    flexiTime: {
        time_in: string;
        time_out: string;
    };
};

type Employee = {
    id: number;
    name: string;
    office?: string;
    shift?: {
        name: string;
        start_time: string;
        end_time: string;
    } | null;
};

interface Props {
    dtr: DTRData;
    filters: {
        year: number;
        month: number;
    };
    availableYears: number[];
    availableMonths: number[];
    employee: Employee;
}

const MONTHS = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];

export default function EmployeeDTR({ dtr, filters, availableYears, availableMonths, employee }: Props) {
    const getInitials = useInitials();
    const [selectedYear, setSelectedYear] = useState(filters.year.toString());
    const [selectedMonth, setSelectedMonth] = useState(filters.month.toString());

    const totalLate = dtr.records.reduce((sum, r) => sum + (r.late_minutes || 0), 0);
    const totalLateHours = Math.floor(totalLate / 60);
    const totalLateMins = totalLate % 60;
    const totalHoursWorked = dtr.records.reduce((sum, r) => sum + (r.total_hours || 0), 0);

    const handleFilterChange = (year: string, month: string) => {
        router.get(
            route('employee.dtr'),
            { year, month },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
        handleFilterChange(year, selectedMonth);
    };

    const handleMonthChange = (month: string) => {
        setSelectedMonth(month);
        handleFilterChange(selectedYear, month);
    };

    const handleReset = () => {
        const currentYear = new Date().getFullYear().toString();
        const currentMonth = (new Date().getMonth() + 1).toString();
        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);
        handleFilterChange(currentYear, currentMonth);
    };

    const handlePrint = () => {
        const params = new URLSearchParams();
        params.set('year', selectedYear);
        params.set('month', selectedMonth);
        window.open(route('employee.dtr.print') + '?' + params.toString(), '_blank');
    };

    const getMonthName = (month: number) => {
        return MONTHS.find((m) => m.value === month)?.label || '';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <Head title="My DTR" />

            <EmployeeHeader employee={employee as any} />

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        My <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Daily Time Record</span>
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">View and print your attendance records.</p>
                </div>

                {/* Filters */}
                <Card className="mb-6 border-0 bg-white shadow-lg shadow-slate-200/50 dark:bg-slate-800 dark:shadow-slate-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            Select Period
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Year:</span>
                                <Select value={selectedYear} onValueChange={handleYearChange}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableYears.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Month:</span>
                                <Select value={selectedMonth} onValueChange={handleMonthChange}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableMonths.length > 0
                                            ? availableMonths.map((month) => (
                                                  <SelectItem key={month} value={month.toString()}>
                                                      {getMonthName(month)}
                                                  </SelectItem>
                                              ))
                                            : MONTHS.map((month) => (
                                                  <SelectItem key={month.value} value={month.value.toString()}>
                                                      {month.label}
                                                  </SelectItem>
                                              ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
                                    <RotateCcw className="h-4 w-4" />
                                    Reset
                                </Button>
                                <Button variant="default" size="sm" onClick={handlePrint} className="gap-1">
                                    <Printer className="h-4 w-4" />
                                    Print DTR
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span>Showing:</span>
                            <span className="rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                {getMonthName(parseInt(selectedMonth))} {selectedYear}
                            </span>
                            {employee.shift && (
                                <span className="ml-2 text-slate-500">
                                    (Shift: {employee.shift.name} | {employee.shift.start_time} - {employee.shift.end_time})
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* DTR Table */}
                <Card className="border-0 bg-white shadow-lg shadow-slate-200/50 dark:bg-slate-800 dark:shadow-slate-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                {dtr.forTheMonthOf}
                            </span>
                            <div className="text-sm text-slate-500">
                                Total Late:{' '}
                                <span className="font-bold text-red-600">
                                    {totalLateHours}h {totalLateMins}m
                                </span>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-2 border-slate-800 bg-slate-100 dark:bg-slate-700">
                                        <th rowSpan={2} className="border-2 border-slate-800 px-2 py-2 text-center font-bold">
                                            DAY
                                        </th>
                                        <th colSpan={2} className="border-2 border-slate-800 px-2 py-1 text-center font-bold">
                                            A.M.
                                        </th>
                                        <th colSpan={2} className="border-2 border-slate-800 px-2 py-1 text-center font-bold">
                                            P.M.
                                        </th>
                                        <th colSpan={2} className="border-2 border-slate-800 px-2 py-1 text-center font-bold">
                                            UNDERTIME
                                        </th>
                                        <th rowSpan={2} className="border-2 border-slate-800 px-2 py-2 text-center font-bold">
                                            TOTAL HOURS
                                        </th>
                                    </tr>
                                    <tr className="border-2 border-slate-800 bg-slate-100 dark:bg-slate-700">
                                        <th className="border-2 border-slate-800 px-2 py-1 text-center text-xs">Arrival</th>
                                        <th className="border-2 border-slate-800 px-2 py-1 text-center text-xs">Departure</th>
                                        <th className="border-2 border-slate-800 px-2 py-1 text-center text-xs">Arrival</th>
                                        <th className="border-2 border-slate-800 px-2 py-1 text-center text-xs">Departure</th>
                                        <th className="border-2 border-slate-800 px-2 py-1 text-center text-xs">Hours</th>
                                        <th className="border-2 border-slate-800 px-2 py-1 text-center text-xs">Minutes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: 31 }, (_, i) => {
                                        const currentDay = i + 1;
                                        const record = dtr.records.find((r) => dayjs(r.date).date() === currentDay);
                                        const dayLate = record?.late_minutes || 0;
                                        const lateHours = Math.floor(Math.abs(dayLate) / 60);
                                        const lateMins = Math.abs(dayLate) % 60;
                                        const dayOfWeek = record ? dayjs(record.date).day() : -1;
                                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                                        return (
                                            <tr key={currentDay} className={isWeekend ? 'bg-slate-50 dark:bg-slate-800/50' : ''}>
                                                <td className="border-2 border-slate-300 px-2 py-1 text-center font-medium dark:border-slate-600">
                                                    {currentDay}
                                                </td>
                                                <td className="border-2 border-slate-300 px-2 py-1 text-center dark:border-slate-600">
                                                    {record?.am_in || (isWeekend ? (dayOfWeek === 0 ? 'SUN' : 'SAT') : '')}
                                                </td>
                                                <td className="border-2 border-slate-300 px-2 py-1 text-center dark:border-slate-600">
                                                    {record?.am_out || ''}
                                                </td>
                                                <td className="border-2 border-slate-300 px-2 py-1 text-center dark:border-slate-600">
                                                    {record?.pm_in || ''}
                                                </td>
                                                <td className="border-2 border-slate-300 px-2 py-1 text-center dark:border-slate-600">
                                                    {record?.pm_out || ''}
                                                </td>
                                                <td className="border-2 border-slate-300 px-2 py-1 text-center dark:border-slate-600">
                                                    {dayLate > 0 ? lateHours : ''}
                                                </td>
                                                <td className="border-2 border-slate-300 px-2 py-1 text-center dark:border-slate-600">
                                                    {dayLate > 0 ? lateMins : ''}
                                                </td>
                                                <td className="border-2 border-slate-300 px-2 py-1 text-center dark:border-slate-600">
                                                    {record?.total_hours ? record.total_hours.toFixed(2) : ''}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-100 dark:bg-slate-700">
                                        <td
                                            colSpan={6}
                                            className="border-2 border-slate-800 px-2 py-2 pr-4 text-right font-bold text-slate-900 dark:text-white"
                                        >
                                            TOTAL
                                        </td>
                                        <td className="border-2 border-slate-800 px-2 py-2 text-center font-bold text-slate-900 dark:text-white">
                                            {totalLateHours || ''}
                                        </td>
                                        <td className="border-2 border-slate-800 px-2 py-2 text-center font-bold text-slate-900 dark:text-white">
                                            {totalLateMins || ''}
                                        </td>
                                        <td className="border-2 border-slate-800 px-2 py-2 text-center font-bold text-slate-900 dark:text-white">
                                            {totalHoursWorked.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
