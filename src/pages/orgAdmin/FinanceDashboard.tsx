// src/pages/orgAdmin/FinanceDashboard.tsx
import { useState, useMemo } from "react";
import {
    DollarSign,
    TrendingUp,
    Users,
    BookOpen,
    Download,
    Calendar,
    FileText,
    PieChart as PieChartIcon,
    BarChart3
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart } from "@/components/ui/charts/pie-chart";
import { BarChart } from "@/components/ui/charts/bar-chart";

interface FinanceData {
    id: number;
    examName: string;
    examDate: string;
    totalRegistrations: number;
    paidRegistrations: number;
    unpaidRegistrations: number;
    examFee: number;
    totalRevenue: number;
    paidRevenue: number;
    unpaidRevenue: number;
    university: string;
}

const mockFinanceData: FinanceData[] = [
    {
        id: 1,
        examName: "General Certificate of Competency Test (GCCT)",
        examDate: "2025-07-15",
        totalRegistrations: 423,
        paidRegistrations: 387,
        unpaidRegistrations: 36,
        examFee: 2500,
        totalRevenue: 1057500,
        paidRevenue: 967500,
        unpaidRevenue: 90000,
        university: "University of Colombo School of Computing"
    },
    {
        id: 2,
        examName: "BIT Aptitude Test",
        examDate: "2025-07-20",
        totalRegistrations: 190,
        paidRegistrations: 175,
        unpaidRegistrations: 15,
        examFee: 3000,
        totalRevenue: 570000,
        paidRevenue: 525000,
        unpaidRevenue: 45000,
        university: "University of Colombo School of Computing"
    },
    {
        id: 3,
        examName: "Software Engineering Assessment",
        examDate: "2025-07-25",
        totalRegistrations: 87,
        paidRegistrations: 82,
        unpaidRegistrations: 5,
        examFee: 4500,
        totalRevenue: 391500,
        paidRevenue: 369000,
        unpaidRevenue: 22500,
        university: "University of Colombo School of Computing"
    },
    {
        id: 4,
        examName: "Computer Science Entrance Exam",
        examDate: "2025-06-30",
        totalRegistrations: 298,
        paidRegistrations: 298,
        unpaidRegistrations: 0,
        examFee: 2000,
        totalRevenue: 596000,
        paidRevenue: 596000,
        unpaidRevenue: 0,
        university: "University of Colombo School of Computing"
    },
    {
        id: 5,
        examName: "Information Systems Aptitude Test",
        examDate: "2025-08-10",
        totalRegistrations: 45,
        paidRegistrations: 38,
        unpaidRegistrations: 7,
        examFee: 3500,
        totalRevenue: 157500,
        paidRevenue: 133000,
        unpaidRevenue: 24500,
        university: "University of Colombo School of Computing"
    },
    {
        id: 6,
        examName: "Data Science Certification Exam",
        examDate: "2025-08-05",
        totalRegistrations: 312,
        paidRegistrations: 289,
        unpaidRegistrations: 23,
        examFee: 5000,
        totalRevenue: 1560000,
        paidRevenue: 1445000,
        unpaidRevenue: 115000,
        university: "University of Colombo School of Computing"
    }
];

const examOptions = [
    { value: "all", label: "All Exams" },
    ...mockFinanceData.map(exam => ({
        value: exam.id.toString(),
        label: exam.examName
    }))
];

export default function FinanceDashboard() {
    const [selectedExam, setSelectedExam] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [chartType, setChartType] = useState<"pie" | "bar">("bar");

    const filteredData = useMemo(() => {
        return mockFinanceData.filter(exam => {
            const matchesExam = selectedExam === "all" || exam.id.toString() === selectedExam;

            let matchesMonth = true;
            if (selectedMonth) {
                const examDate = new Date(exam.examDate);
                const examMonth = examDate.toISOString().slice(0, 7); // YYYY-MM format
                matchesMonth = examMonth === selectedMonth;
            }

            return matchesExam && matchesMonth;
        });
    }, [selectedExam, selectedMonth]);

    const summary = useMemo(() => {
        const totalExams = filteredData.length;
        const totalStudents = filteredData.reduce((sum, exam) => sum + exam.totalRegistrations, 0);
        const totalRevenue = filteredData.reduce((sum, exam) => sum + exam.paidRevenue, 0);
        const totalPaid = filteredData.reduce((sum, exam) => sum + exam.paidRegistrations, 0);
        const totalUnpaid = filteredData.reduce((sum, exam) => sum + exam.unpaidRegistrations, 0);
        const pendingRevenue = filteredData.reduce((sum, exam) => sum + exam.unpaidRevenue, 0);

        return {
            totalExams,
            totalStudents,
            totalRevenue,
            totalPaid,
            totalUnpaid,
            pendingRevenue,
            paymentRate: totalStudents > 0 ? ((totalPaid / totalStudents) * 100).toFixed(1) : "0"
        };
    }, [filteredData]);

    const chartData = useMemo(() => {
        return filteredData.map(exam => ({
            name: exam.examName.length > 20 ? exam.examName.substring(0, 20) + "..." : exam.examName,
            value: exam.paidRevenue,
            registrations: exam.totalRegistrations
        }));
    }, [filteredData]);

    const pieChartData = useMemo(() => {
        return [
            { name: "Paid", value: summary.totalPaid },
            { name: "Unpaid", value: summary.totalUnpaid }
        ];
    }, [summary]);

    const resetFilters = () => {
        setSelectedExam("all");
        setSelectedMonth("");
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const exportToCSV = () => {
        const headers = [
            "Exam Name",
            "Date",
            "Total Registrations",
            "Paid",
            "Unpaid",
            "Fee (LKR)",
            "Total Revenue (LKR)",
            "Paid Revenue (LKR)",
            "Pending Revenue (LKR)"
        ];

        const csvData = filteredData.map(exam => [
            exam.examName,
            exam.examDate,
            exam.totalRegistrations,
            exam.paidRegistrations,
            exam.unpaidRegistrations,
            exam.examFee,
            exam.totalRevenue,
            exam.paidRevenue,
            exam.unpaidRevenue
        ]);

        const csvContent = [
            headers.join(","),
            ...csvData.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `finance-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportToPDF = () => {
        // This would integrate with a PDF library like jsPDF
        alert("PDF export functionality would be implemented with a library like jsPDF");
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
                            <p className="text-gray-600 text-sm">Revenue and registration summary for all exams</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={exportToCSV}>
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                        <Button variant="outline" onClick={exportToPDF}>
                            <FileText className="w-4 h-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Exam
                                </label>
                                <select
                                    value={selectedExam}
                                    onChange={(e) => setSelectedExam(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {examOptions.map(exam => (
                                        <option key={exam.value} value={exam.value}>{exam.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by Month
                                </label>
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={resetFilters}
                                    className="w-full"
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Exams</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.totalExams}</p>
                                </div>
                                <BookOpen className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Students</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.totalStudents.toLocaleString()}</p>
                                    <p className="text-xs text-green-600">{summary.paymentRate}% paid</p>
                                </div>
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalRevenue)}</p>
                                    <p className="text-xs text-gray-500">Collected</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending Revenue</p>
                                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.pendingRevenue)}</p>
                                    <p className="text-xs text-gray-500">{summary.totalUnpaid} unpaid</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>



                {/* Charts and Table */}
                <div className="space-y-6 mb-6">
                    {/* Financial Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Financial Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-green-600 font-medium">Paid Students</p>
                                            <p className="text-2xl font-bold text-green-700">{summary.totalPaid}</p>
                                        </div>
                                        <div className="text-green-600">
                                            <Users className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-red-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-red-600 font-medium">Unpaid Students</p>
                                            <p className="text-2xl font-bold text-red-700">{summary.totalUnpaid}</p>
                                        </div>
                                        <div className="text-red-600">
                                            <Users className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-600 font-medium">Collected Revenue</p>
                                            <p className="text-xl font-bold text-blue-700">{formatCurrency(summary.totalRevenue)}</p>
                                        </div>
                                        <div className="text-blue-600">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-orange-600 font-medium">Pending Revenue</p>
                                            <p className="text-xl font-bold text-orange-700">{formatCurrency(summary.pendingRevenue)}</p>
                                        </div>
                                        <div className="text-orange-600">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chart Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    {chartType === "pie" ? <PieChartIcon className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                                    {chartType === "pie" ? "Payment Status" : "Exam Revenue"}
                                </CardTitle>
                                <div className="flex gap-1">
                                    <Button
                                        variant={chartType === "bar" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setChartType("bar")}
                                        className="px-2"
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={chartType === "pie" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setChartType("pie")}
                                        className="px-2"
                                    >
                                        <PieChartIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-83">
                                {chartType === "pie" ? (
                                    <PieChart data={pieChartData} />
                                ) : (
                                    <BarChart data={chartData} />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Finance Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Detailed Finance Report ({filteredData.length} exams)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Exam Name</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Total Registrations</TableHead>
                                        <TableHead>Paid</TableHead>
                                        <TableHead>Unpaid</TableHead>
                                        <TableHead>Fee</TableHead>
                                        <TableHead>Revenue</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.map((exam) => {
                                        const paymentRate = (exam.paidRegistrations / exam.totalRegistrations) * 100;
                                        return (
                                            <TableRow key={exam.id}>
                                                <TableCell>
                                                    <div className="font-medium">{exam.examName}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        {formatDate(exam.examDate)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{exam.totalRegistrations}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-green-600 font-medium">{exam.paidRegistrations}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-red-600 font-medium">{exam.unpaidRegistrations}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{formatCurrency(exam.examFee)}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-green-600">{formatCurrency(exam.paidRevenue)}</div>
                                                        {exam.unpaidRevenue > 0 && (
                                                            <div className="text-xs text-orange-600">
                                                                +{formatCurrency(exam.unpaidRevenue)} pending
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`${paymentRate === 100
                                                            ? 'bg-green-100 text-green-800'
                                                            : paymentRate >= 80
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}
                                                    >
                                                        {paymentRate.toFixed(0)}% paid
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
