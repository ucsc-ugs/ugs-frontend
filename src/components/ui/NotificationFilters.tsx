import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface FilterProps {
    onFilterChange: (filters: FilterState) => void;
    totalCount?: number;
    readCount?: number;
    unreadCount?: number;
}

export interface FilterState {
    readStatus: 'all' | 'read' | 'unread';
    dateRange: 'all' | 'today';
}

export const NotificationFilters = ({
    onFilterChange,
    totalCount = 0,
    readCount = 0,
    unreadCount = 0
}: FilterProps) => {
    const [filters, setFilters] = useState<FilterState>({
        readStatus: 'all',
        dateRange: 'all',
    });

    const handleFilterChange = (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="w-full flex justify-center mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4 flex flex-row items-center gap-3">
                <button
                    onClick={() => handleFilterChange('readStatus', 'all')}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${filters.readStatus === 'all'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                >
                    All Notifications
                    <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white">
                        {totalCount}
                    </span>
                </button>
                <button
                    onClick={() => handleFilterChange('readStatus', 'unread')}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${filters.readStatus === 'unread'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                >
                    Unread
                    <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white">
                        {unreadCount}
                    </span>
                </button>
                <button
                    onClick={() => handleFilterChange('readStatus', 'read')}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${filters.readStatus === 'read'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                >
                    Read
                    <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white">
                        {readCount}
                    </span>
                </button>

                {/* Vertical separator */}
                <div className="h-8 w-px bg-gray-300"></div>

                <button
                    onClick={() => handleFilterChange('dateRange', 'all')}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${filters.dateRange === 'all'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                >
                    <Calendar className="w-4 h-4 mr-1" />
                    All Time
                </button>
                <button
                    onClick={() => handleFilterChange('dateRange', 'today')}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${filters.dateRange === 'today'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                >
                    Today
                </button>
            </div>
        </div>
    );
};