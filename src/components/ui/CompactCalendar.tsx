import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock, AlertTriangle, Info, CheckCircle, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

interface ExamDate {
    id: number;
    exam_id: number;
    exam_title: string;
    exam_code: string;
    date: string;
    location: string;
    status: string;
}

interface ImportantDate {
    date: Date;
    title: string;
    description: string;
    type: "exam" | "deadline" | "result" | "event";
    time?: string;
    location?: string;
    status?: string;
}

const typeConfig = {
    exam: {
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-100",
        outlineColor: "border-2 border-red-500 text-red-600",
        selectedBgColor: "bg-red-500/5"
    },
    deadline: {
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        outlineColor: "border-2 border-orange-500 text-orange-600",
        selectedBgColor: "bg-orange-500/5"
    },
    result: {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
        outlineColor: "border-2 border-green-500 text-green-600",
        selectedBgColor: "bg-green-500/5"
    },
    event: {
        icon: Info,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        outlineColor: "border-2 border-blue-500 text-blue-600",
        selectedBgColor: "bg-blue-500/5"
    }
};

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const CompactCalendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [popoverDate, setPopoverDate] = useState<Date | null>(null);
    const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);

    // Fetch exam dates from API
    useEffect(() => {
        const fetchExamDates = async () => {
            try {
                const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
                if (!token) {
                    console.log("No auth token found");
                    return;
                }

                const headers: HeadersInit = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                };

                console.log("Fetching exam dates from API...");
                const response = await fetch("http://localhost:8000/api/student/exam-dates", { headers });

                if (response.ok) {
                    const examDates: ExamDate[] = await response.json();
                    console.log("Received exam dates:", examDates);

                    // Transform exam dates to important dates format
                    const transformed: ImportantDate[] = examDates.map(exam => {
                        // Parse date - handle both ISO and MySQL datetime formats
                        const dateStr = exam.date.replace(' ', 'T'); // Convert MySQL format to ISO
                        const examDateTime = parseISO(dateStr);
                        console.log("Parsing date:", exam.date, "→", dateStr, "→", examDateTime);
                        return {
                            date: examDateTime,
                            title: `${exam.exam_code}: ${exam.exam_title}`,
                            description: exam.location,
                            type: "exam" as const,
                            time: format(examDateTime, "hh:mm a"),
                            location: exam.location,
                            status: exam.status
                        };
                    });

                    console.log("Transformed dates:", transformed);
                    setImportantDates(transformed);
                } else {
                    console.error("API response not OK:", response.status, response.statusText);
                }
            } catch (error) {
                console.error("Failed to fetch exam dates:", error);
            }
        };

        fetchExamDates();
    }, []);

    const getImportantDate = (date: Date): ImportantDate | undefined => {
        const found = importantDates.find(importantDate =>
            isSameDay(importantDate.date, date)
        );
        // Debug: Log when we find a match
        if (found) {
            console.log("Found exam date match:", { calendarDate: date, examDate: found });
        }
        return found;
    };

    const handleDateClick = (date: Date) => {
        const importantDate = getImportantDate(date);
        if (importantDate) {
            setPopoverDate(date);
        }
        setSelectedDate(date);
    };

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding days from previous month
    const startDay = getDay(monthStart);
    const paddingDays = Array.from({ length: startDay }, () => null);

    const allDays = [...paddingDays, ...daysInMonth];

    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
        weeks.push(allDays.slice(i, i + 7));
    }

    const selectedImportantDate = popoverDate ? getImportantDate(popoverDate) : null;

    return (
        <div className="w-full max-w-md bg-card rounded-lg border shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-[rgba(30,41,82,0.5)] px-4 py-3 text-primary-foreground">
                <div className="flex items-center justify-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <h2 className="text-sm font-semibold">Important Dates</h2>
                </div>
            </div>

            {/* Calendar Body */}
            <div className="p-4">
                <Popover open={!!popoverDate} onOpenChange={(open) => !open && setPopoverDate(null)}>
                    <PopoverTrigger asChild>
                        <div className="w-full">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                    className="p-1 hover:bg-accent rounded-md transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <h3 className="text-sm font-medium">
                                    {format(currentMonth, "MMMM yyyy")}
                                </h3>
                                <button
                                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                    className="p-1 hover:bg-accent rounded-md transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="w-full">
                                {/* Days of Week Header */}
                                <div className="grid grid-cols-7 gap-0 mb-1">
                                    {daysOfWeek.map((day) => (
                                        <div
                                            key={day}
                                            className="h-10 flex items-center justify-center text-sm font-medium text-muted-foreground"
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="grid grid-cols-7 gap-0">
                                    {weeks.map((week, weekIndex) =>
                                        week.map((day, dayIndex) => {
                                            if (!day) {
                                                return (
                                                    <div
                                                        key={`empty-${weekIndex}-${dayIndex}`}
                                                        className="h-10 flex items-center justify-center"
                                                    />
                                                );
                                            }

                                            const importantDate = getImportantDate(day);
                                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                                            const isToday = isSameDay(day, new Date());

                                            return (<button
                                                key={day.toISOString()}
                                                onClick={() => handleDateClick(day)}
                                                className={cn(
                                                    "h-10 flex items-center justify-center text-sm font-medium rounded-md transition-colors",
                                                    importantDate && isSelected
                                                        ? `${typeConfig[importantDate.type].outlineColor} ${typeConfig[importantDate.type].selectedBgColor}`
                                                        : importantDate
                                                            ? typeConfig[importantDate.type].outlineColor
                                                            : isSelected
                                                                ? "border-2 border-gray-700 text-gray-800"
                                                                : isToday
                                                                    ? "bg-accent text-accent-foreground font-semibold"
                                                                    : "hover:bg-accent hover:text-accent-foreground"
                                                )}
                                            >
                                                {format(day, "d")}
                                            </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </PopoverTrigger>

                    {selectedImportantDate && (
                        <PopoverContent className="w-80 p-0 border-0 shadow-lg" align="center">
                            <div className="bg-card rounded-lg overflow-hidden border">
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "flex-shrink-0 p-2 rounded-full",
                                            typeConfig[selectedImportantDate.type].bgColor
                                        )}>
                                            {React.createElement(typeConfig[selectedImportantDate.type].icon, {
                                                className: cn("w-4 h-4", typeConfig[selectedImportantDate.type].color)
                                            })}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground mb-1">
                                                {selectedImportantDate.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {selectedImportantDate.description}
                                            </p>
                                            <div className="space-y-2 mb-3">
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarIcon className="w-3 h-3" />
                                                        {format(selectedImportantDate.date, "MMM dd, yyyy")}
                                                    </span>
                                                    {selectedImportantDate.time && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {selectedImportantDate.time}
                                                        </span>
                                                    )}
                                                </div>
                                                {selectedImportantDate.location && (
                                                    <div className="flex items-start gap-1 text-xs text-muted-foreground">
                                                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                        <span>{selectedImportantDate.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "inline-block px-2 py-1 text-xs font-medium rounded-full",
                                                    typeConfig[selectedImportantDate.type].bgColor,
                                                    typeConfig[selectedImportantDate.type].color
                                                )}>
                                                    {selectedImportantDate.type.toUpperCase()}
                                                </div>
                                                {selectedImportantDate.status && (
                                                    <div className={cn(
                                                        "inline-block px-2 py-1 text-xs font-medium rounded-full",
                                                        selectedImportantDate.status === 'upcoming' ? "bg-blue-100 text-blue-700" :
                                                            selectedImportantDate.status === 'completed' ? "bg-gray-100 text-gray-700" :
                                                                "bg-yellow-100 text-yellow-700"
                                                    )}>
                                                        {selectedImportantDate.status.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    )}
                </Popover>
            </div>
        </div>
    );
};
