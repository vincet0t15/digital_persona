import { Link } from '@inertiajs/react';
import type { PaginatedDataResponse } from '@/types/pagination';

export default function Pagination({
    data,
}: {
    data: PaginatedDataResponse<any>;
}) {
    return (
        <div className="mt-4 flex items-center justify-between gap-2">
            <p>
                Showing <strong>{data.from}</strong> to{' '}
                <strong>{data.to}</strong> from Total{' '}
                <strong>{data.total}</strong>
            </p>
            <div className="flex gap-1">
                {data.links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url ?? '#'}
                        preserveState
                        preserveScroll
                        className={`rounded border px-3 py-1 text-sm transition-colors ${link.active
                            ? 'bg-primary text-white dark:bg-gray-100 dark:text-black'
                            : 'border-gray-300 bg-white text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
                            } ${!link.url ? 'pointer-events-none opacity-50' : ''} `}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
}
