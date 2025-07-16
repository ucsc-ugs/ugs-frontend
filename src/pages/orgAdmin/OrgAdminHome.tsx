import {
    BookOpen,
    Home,
    DollarSign,
    FileText,
    Calendar,
    BarChart2,
    TrendingUp,
    Clock,
    ChevronRight,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart } from "@/components/ui/charts/bar-chart";
import { PieChart } from "@/components/ui/charts/pie-chart";

export default function AdminDashboard() {
    // Mock data - replace with real API calls
    const stats = {
        totalExams: 24,
        activeExams: 8,
        totalRegistrations: 1243,
        pendingRegistrations: 42,
        totalRevenue: 1256000,
        revenueChange: 12.5,
        upcomingExams: 5,
    };

    const registrationData = [
        { name: 'Jan', value: 120 },
        { name: 'Feb', value: 210 },
        { name: 'Mar', value: 180 },
        { name: 'Apr', value: 250 },
        { name: 'May', value: 195 },
        { name: 'Jun', value: 288 },
    ];

    const examDistribution = [
        { name: 'Undergraduate', value: 45 },
        { name: 'Postgraduate', value: 30 },
        { name: 'Professional', value: 15 },
        { name: 'Diploma', value: 10 },
    ];

    const recentRegistrations = [
        { id: 1, student: "John Doe", exam: "Final Year Exam", date: "2023-06-15", status: "completed" },
        { id: 2, student: "Jane Smith", exam: "Mid Term Exam", date: "2023-06-14", status: "pending" },
        { id: 3, student: "Robert Johnson", exam: "Practical Test", date: "2023-06-14", status: "completed" },
        { id: 4, student: "Emily Davis", exam: "Final Year Exam", date: "2023-06-13", status: "rejected" },
        { id: 5, student: "Michael Wilson", exam: "Entrance Exam", date: "2023-06-12", status: "completed" },
    ];

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto p-4 lg:p-6 ">

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Home className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                            <p className="text-gray-600 text-sm">Overview of exams, registrations, and statistics</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Last updated: Today, 10:45 AM</span>
                    </div>
                </div>

                <div className="flex flex-col gap-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 gap-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalExams}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.activeExams} active exams
                                </p>
                            </CardContent>
                            <CardFooter className="p-2 pt-0">
                                <Button variant="ghost" size="sm" className="text-xs h-6">
                                    View all
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Registrations</CardTitle>
                                <Home className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalRegistrations.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.pendingRegistrations} pending approval
                                </p>
                            </CardContent>
                            <CardFooter className="p-2 pt-0">
                                <Button variant="ghost" size="sm" className="text-xs h-6">
                                    Manage
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">LKR {stats.totalRevenue.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                    {stats.revenueChange}% from last period
                                </p>
                            </CardContent>
                            <CardFooter className="p-2 pt-0">
                                <Button variant="ghost" size="sm" className="text-xs h-6">
                                    View report
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.upcomingExams}</div>
                                <p className="text-xs text-muted-foreground">
                                    Next exam in 3 days
                                </p>
                            </CardContent>
                            <CardFooter className="p-2 pt-0">
                                <Button variant="ghost" size="sm" className="text-xs h-6">
                                    Schedule
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart2 className="h-5 w-5" />
                                        Registration Trends
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" className="text-sm h-8">
                                        View details <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <BarChart data={registrationData} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Exam Distribution
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" className="text-sm h-8">
                                        View all <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <PieChart data={examDistribution} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Recent Registrations
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="text-sm h-8">
                                    View all <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Exam</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentRegistrations.map((reg) => (
                                        <TableRow key={reg.id}>
                                            <TableCell className="font-medium">{reg.student}</TableCell>
                                            <TableCell>{reg.exam}</TableCell>
                                            <TableCell>{reg.date}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    variant={reg.status === 'completed' ? 'default' :
                                                        reg.status === 'pending' ? 'secondary' : 'destructive'}
                                                    className="flex items-center gap-1 justify-end"
                                                >
                                                    {reg.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                                                    {reg.status === 'pending' && <Clock className="h-3 w-3" />}
                                                    {reg.status === 'rejected' && <XCircle className="h-3 w-3" />}
                                                    <span className="capitalize">{reg.status}</span>
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
