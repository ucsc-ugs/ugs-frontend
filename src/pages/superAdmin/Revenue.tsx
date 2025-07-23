import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Building2, BookOpen, Calendar, PieChart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";

interface RevenueData {
  total_revenue: number;
  total_commission: number;
  organization_revenues: Array<{
    id: number;
    name: string;
    revenue: number;
    commission: number;
    exam_count: number;
  }>;
  exam_revenues: Array<{
    id: number;
    name: string;
    organization_name: string;
    revenue: number;
    commission: number;
    attempt_count: number;
  }>;
  monthly_revenues: Array<{
    month: string;
    revenue: number;
    commission: number;
  }>;
}

export default function RevenueDashboard() {
  const dummyRevenueData: RevenueData = {
    total_revenue: 2105000,
    total_commission: 315000,
    organization_revenues: [
      {
        id: 1,
        name: "UCSC",
        revenue: 780000,
        commission: 32500,
        exam_count: 3
      },
      {
        id: 2,
        name: "UOM",
        revenue: 980000,
        commission: 75400,
        exam_count: 2
      },
      {
        id: 3,
        name: "UOK",
        revenue: 1254000,
        commission: 98000,
        exam_count: 1
      }
    ],
    exam_revenues: [
      {
        id: 1,
        name: "GCAT",
        organization_name: "UCSC",
        revenue: 4500.75,
        commission: 675.11,
        attempt_count: 90
      },
      {
        id: 2,
        name: "FIT",
        organization_name: "UCSC",
        revenue: 3500.50,
        commission: 700.10,
        attempt_count: 70
      },
      {
        id: 3,
        name: "GCCT",
        organization_name: "Business College",
        revenue: 2500.00,
        commission: 200.00,
        attempt_count: 50
      },
      {
        id: 4,
        name: "MAT",
        organization_name: "UOM",
        revenue: 2000.00,
        commission: 300.00,
        attempt_count: 40
      }
    ],
    monthly_revenues: [
      { month: "Jan", revenue: 12000, commission: 1800 },
      { month: "Feb", revenue: 19000, commission: 2850 },
      { month: "Mar", revenue: 15000, commission: 2250 },
      { month: "Apr", revenue: 18000, commission: 2700 },
      { month: "May", revenue: 21000, commission: 3150 },
      { month: "Jun", revenue: 24000, commission: 3600 },
      { month: "Jul", revenue: 16000, commission: 2400 }
    ]
  };

  const [data] = useState<RevenueData>(dummyRevenueData);
  const [timeRange, setTimeRange] = useState("all_time");
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-gray-600 mt-2">Track earnings and commissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_quarter">Last Quarter</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'organizations' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('organizations')}
        >
          By Organization
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'exams' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('exams')}
        >
          By Exam
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(data.total_revenue)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Commission</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(data.total_commission)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Net Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(data.total_revenue - data.total_commission)}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <PieChart className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                Revenue Trends
              </CardTitle>
              <CardDescription className="text-gray-600">
                Monthly revenue and commission breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.monthly_revenues}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#4f46e5" />
                  <Bar dataKey="commission" name="Commission" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Organizations Tab */}
      {activeTab === 'organizations' && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Building2 className="h-5 w-5 text-gray-600" />
              Revenue by Organization
            </CardTitle>
            <CardDescription className="text-gray-600">
              Breakdown of revenue generated by each organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Exams</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.organization_revenues.map((org) => (
                  <TableRow key={org.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        {org.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{org.exam_count}</Badge>
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(org.revenue)}
                    </TableCell>
                    <TableCell className="text-purple-600 font-medium">
                      {formatCurrency(org.commission)}
                    </TableCell>
                    <TableCell className="text-blue-600 font-medium">
                      {formatCurrency(org.revenue - org.commission)}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <BookOpen className="h-5 w-5 text-gray-600" />
              Revenue by Exam
            </CardTitle>
            <CardDescription className="text-gray-600">
              Breakdown of revenue generated by each exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.exam_revenues.map((exam) => (
                  <TableRow key={exam.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        {exam.name}
                      </div>
                    </TableCell>
                    <TableCell>{exam.organization_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{exam.attempt_count}</Badge>
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(exam.revenue)}
                    </TableCell>
                    <TableCell className="text-purple-600 font-medium">
                      {formatCurrency(exam.commission)}
                    </TableCell>
                    <TableCell className="text-blue-600 font-medium">
                      {formatCurrency(exam.revenue - exam.commission)}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Adjust Commission
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}