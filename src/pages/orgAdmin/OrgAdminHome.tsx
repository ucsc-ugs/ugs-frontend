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
import { useEffect, useState } from 'react';
import { orgAdminApi } from '@/lib/orgAdminApi';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any | null>(null);
    const [registrationData, setRegistrationData] = useState<any[]>([]);
    const [examDistribution, setExamDistribution] = useState<any[]>([]);
    const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const resp = await orgAdminApi.getDashboard();
                const payload = resp.data || resp;

                // Map server payload fields to UI state with safe fallbacks
                setStats({
                    totalExams: Number(payload.total_exams ?? payload.totalExams ?? 0),
                    activeExams: Number(payload.active_exams ?? payload.activeExams ?? 0),
                    totalRegistrations: Number(payload.total_registrations ?? payload.totalRegistrations ?? 0),
                    pendingRegistrations: Number(payload.pending_registrations ?? payload.pendingRegistrations ?? 0),
                    totalRevenue: Number(payload.total_revenue ?? payload.totalRevenue ?? 0),
                    revenueChange: Number(payload.revenue_change ?? payload.revenueChange ?? 0),
                    upcomingExams: Number(payload.upcoming_exams ?? payload.upcomingExams ?? 0),
                });

                setRegistrationData(Array.isArray(payload.monthly_registrations) ? payload.monthly_registrations : (payload.registrationData || []));
                setExamDistribution(Array.isArray(payload.exam_distribution) ? payload.exam_distribution : (payload.examDistribution || examDistribution));
                setRecentRegistrations(Array.isArray(payload.recent_registrations) ? payload.recent_registrations : (payload.recentRegistrations || []));
            } catch (err) {
                console.error('Failed to load org admin dashboard:', err);
                // keep mock/default values if API fails
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

    // registrationData, examDistribution and recentRegistrations are provided from API during load
    // fallbacks used when API data isn't available
    const defaultRegistrationData = [{ name: 'Jan', value: 120 }, { name: 'Feb', value: 210 }, { name: 'Mar', value: 180 }];
    const defaultExamDistribution = [{ name: 'GCAT', value: 45 }, { name: 'GCCT', value: 30 }, { name: 'FIT', value: 15 }];
    const defaultRecent: any[] = [];

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
                                <div className="text-2xl font-bold">{stats?.totalExams ?? 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.activeExams ?? 0} active exams
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
                                <div className="text-2xl font-bold">{(stats?.totalRegistrations ?? 0).toLocaleString()}</div>
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
                                <div className="text-2xl font-bold">LKR {(stats?.totalRevenue ?? 0).toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                    {String(stats?.revenueChange ?? 0)}% from last period
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
                                <div className="text-2xl font-bold">{stats?.upcomingExams ?? 0}</div>
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
                                <BarChart data={(registrationData.length ? registrationData : defaultRegistrationData)} />
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
                                <PieChart data={(examDistribution.length ? examDistribution : defaultExamDistribution)} />
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
                    {(recentRegistrations.length ? recentRegistrations : defaultRecent).map((reg: any, idx: number) => (
                                        <TableRow key={reg.id}>
                        <TableCell className="font-medium">{reg.student || reg.user?.name || `#${reg.id ?? idx}`}</TableCell>
                        <TableCell>{reg.exam || reg.exam_name || ''}</TableCell>
                        <TableCell>{reg.date || reg.exam_date || ''}</TableCell>
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
