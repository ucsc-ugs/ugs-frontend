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
import { getExams } from '@/lib/examApi';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any | null>(null);
    const [registrationData, setRegistrationData] = useState<any[]>([]);
    const [examDistribution, setExamDistribution] = useState<any[]>([]);
    const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // dev payload viewer removed
    const [nextExamDate, setNextExamDate] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const resp = await orgAdminApi.getDashboard();
                const payload = resp.data || resp;
                console.log('orgAdmin dashboard payload:', payload);

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

                // Normalize registration trends into { name, value }[] for BarChart
                const rawMonthly = payload.monthly_registrations ?? payload.registrationData ?? payload.monthly ?? [];
                const normalizeBar = (input: any): { name: string; value: number }[] => {
                    if (!input) return [];
                    if (Array.isArray(input)) {
                        return input.map((item: any) => {
                            if (item == null) return { name: '', value: 0 };
                            // Already in correct shape
                            if (typeof item.name === 'string' && typeof item.value === 'number') return { name: item.name, value: item.value };
                            // Common shape: { month: 'Jan', count: 120 } or { month: 'Jan', value: 120 }
                            if (typeof item.month === 'string' && (typeof item.count === 'number' || typeof item.value === 'number')) {
                                return { name: item.month, value: Number(item.count ?? item.value ?? 0) };
                            }
                            // { label: 'Jan', total: 120 }
                            if (typeof item.label === 'string' && typeof item.total === 'number') {
                                return { name: item.label, value: item.total };
                            }
                            // Fallback: pick first string and first numeric property
                            const nameKey = Object.keys(item).find(k => typeof item[k] === 'string') || 'name';
                            const valueKey = Object.keys(item).find(k => typeof item[k] === 'number') || 'value';
                            return { name: String(item[nameKey] ?? ''), value: Number(item[valueKey] ?? 0) };
                        });
                    }
                    // If object map { Jan: 120, Feb: 210 }
                    if (typeof input === 'object') {
                        return Object.keys(input).map(k => ({ name: k, value: Number(input[k] ?? 0) }));
                    }
                    return [];
                };

                const normalizedMonthly = normalizeBar(rawMonthly);
                setRegistrationData(normalizedMonthly);

                // Normalize exam distribution into { name, value }[] for PieChart
                const rawDistribution = payload.exam_distribution ?? payload.examDistribution ?? payload.distribution ?? [];
                const normalizePie = (input: any): { name: string; value: number }[] => {
                    if (!input) return [];
                    if (Array.isArray(input)) {
                        return input.map((item: any) => {
                            if (item == null) return { name: '', value: 0 };
                            if (typeof item.name === 'string' && typeof item.value === 'number') return { name: item.name, value: item.value };
                            // shape: { exam_type: 'GCAT', count: 50 }
                            const name = item.exam_type ?? item.type ?? item.label ?? item.name;
                            const value = item.count ?? item.value ?? item.total ?? Object.values(item).find((v: any) => typeof v === 'number');
                            return { name: String(name ?? ''), value: Number(value ?? 0) };
                        });
                    }
                    if (typeof input === 'object') {
                        return Object.keys(input).map(k => ({ name: k, value: Number(input[k] ?? 0) }));
                    }
                    return [];
                };

                const normalizedDistribution = normalizePie(rawDistribution);
                setExamDistribution(normalizedDistribution);

                // If dashboard payload didn't include chart data, try client-side aggregation
                if ((normalizedMonthly.length === 0) || (normalizedDistribution.length === 0)) {
                    try {
                        const examsResp = await getExams();
                        const exams = examsResp.data || examsResp;
                        // run same aggregation as fallback
                        const monthly_map: Record<string, number> = {};
                        const distribution_map: Record<string, number> = {};

                        if (Array.isArray(exams)) {
                            exams.forEach((exam: any) => {
                                const examName = exam.name || exam.title || exam.testName || `Exam ${exam.id}`;
                                const dates = exam.exam_dates || exam.examDates || [];
                                dates.forEach((ed: any) => {
                                    const current = Number((ed.current_registrations ?? ed.currentRegistrations ?? ed.pivot?.current_registrations) || 0);
                                    const d = new Date(ed.date || ed.exam_date || ed.date_time || null);
                                    const monthLabel = isNaN(d.getTime()) ? (ed.month || '') : d.toLocaleString('en-US', { month: 'short' });
                                    if (monthLabel) monthly_map[monthLabel] = (monthly_map[monthLabel] || 0) + current;
                                    distribution_map[examName] = (distribution_map[examName] || 0) + current;
                                });
                            });
                        }

                        const monthly_registrations = Object.keys(monthly_map).map(k => ({ name: k, value: monthly_map[k] }));
                        const exam_distribution = Object.keys(distribution_map).map(k => ({ name: k, value: distribution_map[k] }));

                        if (normalizedMonthly.length === 0) setRegistrationData(monthly_registrations);
                        if (normalizedDistribution.length === 0) setExamDistribution(exam_distribution);
                        // derive next exam date from exams if available
                        const nextFromExams = (() => {
                try {
                    let soonest: Date | null = null;
                                if (Array.isArray(exams)) {
                                    exams.forEach((exam: any) => {
                                        const dates = exam.exam_dates || exam.examDates || [];
                                        dates.forEach((ed: any) => {
                                            const d = new Date(ed.date || ed.exam_date || ed.date_time || null);
                                            if (!isNaN(d.getTime()) && d > new Date()) {
                                                if (!soonest || d < soonest) soonest = d;
                                            }
                                        });
                                    });
                                }
                                return soonest ? (soonest as Date).toISOString() : null;
                            } catch { return null; }
                        })();
                        if (nextFromExams) setNextExamDate(nextFromExams);
                    } catch (aggErr) {
                        console.warn('aggregation attempt failed:', aggErr);
                    }
                }

                setRecentRegistrations(Array.isArray(payload.recent_registrations) ? payload.recent_registrations : (payload.recentRegistrations || []));
                // derive next exam date from payload if provided
                const candidateNext = payload.next_exam_date ?? payload.nextExamDate ?? payload.next_exam?.date ?? payload.upcoming_dates?.[0] ?? null;
                if (candidateNext) {
                    try {
                        const d = new Date(candidateNext);
                        if (!isNaN(d.getTime())) setNextExamDate(d.toISOString());
                    } catch {}
                }
            } catch (err) {
                console.error('Failed to load org admin dashboard:', err);
                // Attempt client-side aggregation from exams endpoint as a fallback
                try {
                    const examsResp = await getExams();
                    const exams = examsResp.data || examsResp;
                    // Aggregate
                    const monthly_map: Record<string, number> = {};
                    const distribution_map: Record<string, number> = {};
                    const recent: any[] = [];
                    let totalRegs = 0;

                    if (Array.isArray(exams)) {
                        exams.forEach((exam: any) => {
                            const examName = exam.name || exam.title || exam.testName || `Exam ${exam.id}`;
                            const dates = exam.exam_dates || exam.examDates || [];
                            dates.forEach((ed: any) => {
                                const current = Number((ed.current_registrations ?? ed.currentRegistrations ?? ed.pivot?.current_registrations) || 0);
                                totalRegs += current;

                                const d = new Date(ed.date || ed.exam_date || ed.date_time || null);
                                const monthLabel = isNaN(d.getTime()) ? (ed.month || '') : d.toLocaleString('en-US', { month: 'short' });
                                if (monthLabel) monthly_map[monthLabel] = (monthly_map[monthLabel] || 0) + current;

                                distribution_map[examName] = (distribution_map[examName] || 0) + current;

                                recent.push({ id: ed.id || `${exam.id}-${ed.date}`, student: ed.student_name || '', exam: examName, date: ed.date, status: ed.status || 'registered' });
                            });
                        });
                    }

                    const monthly_registrations = Object.keys(monthly_map).map(k => ({ name: k, value: monthly_map[k] }));
                    const exam_distribution = Object.keys(distribution_map).map(k => ({ name: k, value: distribution_map[k] }));

                    setRegistrationData(monthly_registrations);
                    setExamDistribution(exam_distribution);
                    setRecentRegistrations(recent);
                    setStats({ totalExams: Array.isArray(exams) ? exams.length : 0, totalRegistrations: totalRegs, totalRevenue: 0, upcomingExams: 0 });
                    // derive next exam date from aggregated exams
                    const soonest = (() => {
                        let s: Date | null = null;
                        if (Array.isArray(exams)) {
                            exams.forEach((exam: any) => {
                                const dates = exam.exam_dates || exam.examDates || [];
                                dates.forEach((ed: any) => {
                                    const d = new Date(ed.date || ed.exam_date || ed.date_time || null);
                                    if (!isNaN(d.getTime()) && d > new Date()) {
                                        if (!s || d < s) s = d;
                                    }
                                });
                            });
                        }
                        return s as Date | null;
                    })();
                    if (soonest) setNextExamDate(soonest.toISOString());
                } catch (fallbackErr) {
                    console.error('fallback aggregation failed:', fallbackErr);
                }
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

    // registrationData, examDistribution and recentRegistrations are provided from API during load
    // fallbacks used when API data isn't available
    const defaultRegistrationData: { name: string; value: number }[] = [];
    const defaultExamDistribution: { name: string; value: number }[] = [];
    const defaultRecent: any[] = [];

    // compute human friendly duration until next exam (from ISO string in state)
    const getNextExamRelative = (): string => {
        if (!nextExamDate) return 'No exams scheduled';
        try {
            const d = new Date(nextExamDate);
            if (isNaN(d.getTime())) return 'No exams scheduled';
            const diffMs = d.getTime() - Date.now();
            if (diffMs <= 0) return 'Happening now';
            const mins = Math.round(diffMs / 60000);
            if (mins < 60) return `Next exam in ${mins} minute${mins !== 1 ? 's' : ''}`;
            const hrs = Math.round(mins / 60);
            if (hrs < 24) return `Next exam in ${hrs} hour${hrs !== 1 ? 's' : ''}`;
            const days = Math.round(hrs / 24);
            return `Next exam in ${days} day${days !== 1 ? 's' : ''}`;
        } catch {
            return 'No exams scheduled';
        }
    };

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
                                    {getNextExamRelative()}
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
