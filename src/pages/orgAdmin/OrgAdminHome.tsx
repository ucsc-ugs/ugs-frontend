import { useState, useEffect } from "react";
import axios from "axios";
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

const API_BASE_URL = 'http://localhost:8000/api';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [stats, setStats] = useState({
        totalExams: 0,
        activeExams: 0,
        totalRegistrations: 0,
        pendingRegistrations: 0,
        totalRevenue: 0,
        revenueChange: 0,
        upcomingExams: 0,
    });
    const [registrationData, setRegistrationData] = useState<any[]>([]);
    const [examDistribution, setExamDistribution] = useState<any[]>([]);
    const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${API_BASE_URL}/org-admin/dashboard`, {
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                const data = response.data?.data;
                if (data) {
                    setStats(data.stats || stats);
                    setRegistrationData(data.registrationTrends || []);
                    setExamDistribution(data.examDistribution || []);
                    setRecentRegistrations(data.recentRegistrations || []);
                    setLastUpdated(new Date());
                }
            } catch (err: any) {
                console.error('Failed to fetch dashboard:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-gray-600 text-lg">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="text-red-600 text-lg mb-2">Error loading dashboard</div>
                    <div className="text-gray-600">{error}</div>
                </div>
            </div>
        );
    }

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
                        <span>Last updated: {lastUpdated.toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        })}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-6">
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
