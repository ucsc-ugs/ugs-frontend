/**
 * Revenue Dashboard Component
 * 
 * BACKEND REQUIREMENT:
 * This component requires a backend endpoint at: GET /api/admin/revenue?range={timeRange}
 * 
 * The endpoint must:
 * 1. Be protected by super admin authentication middleware
 * 2. Accept a 'range' query parameter (last_7_days, last_30_days, last_quarter, last_year, all_time)
 * 3. Return JSON with the following structure:
 *    {
 *      "total_revenue": number,
 *      "total_commission": number,
 *      "organization_revenues": [{ id, name, revenue, commission, exam_count }],
 *      "exam_revenues": [{ id, name, organization_name, revenue, commission, attempt_count }],
 *      "monthly_revenues": [{ month, revenue, commission }]
 *    }
 * 
 * Current Error: "Call to a member function isSuperAdmin() on null"
 * This suggests the backend authentication middleware is not properly retrieving the user.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Building2, BookOpen, PieChart as PieChartIcon, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { getRevenueData } from "@/lib/superAdminApi";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';


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
  const [rawData, setRawData] = useState<RevenueData | null>(null);
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("all_time");
  const [activeTab, setActiveTab] = useState("overview");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Client-side filtering function
  const filterDataByTimeRange = (rawData: RevenueData): RevenueData => {
    if (timeRange === "all_time") {
      return rawData;
    }

    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "last_7_days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "last_30_days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "last_quarter":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "last_year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          const endDate = new Date(customEndDate);
          // For custom range, we'll filter based on the date range
          return filterDataByCustomRange(rawData, startDate, endDate);
        }
        return rawData;
      default:
        return rawData;
    }

    // For predefined ranges, filter monthly data
    const filteredMonthlyRevenues = rawData.monthly_revenues?.filter(item => {
      const itemDate = new Date(item.month);
      return itemDate >= startDate && itemDate <= now;
    }) || [];

    // Calculate totals from filtered monthly data
    const totalRevenue = filteredMonthlyRevenues.reduce((sum, item) => sum + item.revenue, 0);
    const totalCommission = filteredMonthlyRevenues.reduce((sum, item) => sum + item.commission, 0);

    return {
      ...rawData,
      monthly_revenues: filteredMonthlyRevenues,
      total_revenue: totalRevenue,
      total_commission: totalCommission,
      // Keep organization and exam revenues as they are (or filter them too if needed)
      organization_revenues: rawData.organization_revenues || [],
      exam_revenues: rawData.exam_revenues || []
    };
  };

  const filterDataByCustomRange = (rawData: RevenueData, startDate: Date, endDate: Date): RevenueData => {
    // Filter monthly data by custom range
    const filteredMonthlyRevenues = rawData.monthly_revenues?.filter(item => {
      const itemDate = new Date(item.month);
      return itemDate >= startDate && itemDate <= endDate;
    }) || [];

    // Calculate totals from filtered monthly data
    const totalRevenue = filteredMonthlyRevenues.reduce((sum, item) => sum + item.revenue, 0);
    const totalCommission = filteredMonthlyRevenues.reduce((sum, item) => sum + item.commission, 0);

    return {
      ...rawData,
      monthly_revenues: filteredMonthlyRevenues,
      total_revenue: totalRevenue,
      total_commission: totalCommission,
      // Keep organization and exam revenues as they are for now
      // You can add more sophisticated filtering here if needed
      organization_revenues: rawData.organization_revenues || [],
      exam_revenues: rawData.exam_revenues || []
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Always fetch all time data from backend
        const response = await getRevenueData('all_time');
        
        // Normalize response to avoid runtime errors if some fields are missing
        const payload = response.data || response;
        const typedPayload = payload as Partial<RevenueData>;
        const normalizedData: RevenueData = {
          total_revenue: Number(typedPayload.total_revenue ?? 0),
          total_commission: Number(typedPayload.total_commission ?? 0),
          organization_revenues: Array.isArray(typedPayload.organization_revenues) ? typedPayload.organization_revenues : [],
          exam_revenues: Array.isArray(typedPayload.exam_revenues) ? typedPayload.exam_revenues : [],
          monthly_revenues: Array.isArray(typedPayload.monthly_revenues) ? typedPayload.monthly_revenues : [],
        };
        
        // Store raw data
        setRawData(normalizedData);
        setError("");
      } catch (err: unknown) {
        console.error("Error fetching revenue data:", err);
        
        // Provide more helpful error messages
        let errorMessage = "Failed to fetch revenue data";
        if (err && typeof err === 'object' && 'status' in err) {
          const error = err as { status: number; message?: string };
          if (error.status === 404) {
            errorMessage = "Revenue endpoint not found. Please contact the administrator.";
          } else if (error.status === 401 || error.status === 403) {
            errorMessage = "Authentication failed. Please log in again.";
          } else if (error.message) {
            errorMessage = error.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Only fetch data once on component mount

  // Apply filtering when time range or custom dates change
  useEffect(() => {
    if (rawData) {
      const filteredData = filterDataByTimeRange(rawData);
      setData(filteredData);
    }
  }, [rawData, timeRange, customStartDate, customEndDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const exportToPDF = () => {
    console.log("Export PDF button clicked");
    if (!data) {
      console.log("No data available for export");
      alert("No data available for export. Please try again later.");
      return;
    }

    try {
      console.log("Starting PDF generation...");
      const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Revenue Report by Organization", 20, 30);
    
    // Add date and time range
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const currentDate = new Date().toLocaleDateString();
    let timeRangeText = timeRange.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Handle custom date range
    if (timeRange === "custom" && customStartDate && customEndDate) {
      const startDate = new Date(customStartDate).toLocaleDateString();
      const endDate = new Date(customEndDate).toLocaleDateString();
      timeRangeText = `Custom Range: ${startDate} to ${endDate}`;
    }
    
    doc.text(`Generated on: ${currentDate}`, 20, 45);
    doc.text(`Time Range: ${timeRangeText}`, 20, 55);
    
    // Add summary section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, 75);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Revenue: ${formatCurrency(data.total_revenue)}`, 20, 85);
    doc.text(`Total Commission: ${formatCurrency(data.total_commission)}`, 20, 95);
    doc.text(`Net Revenue: ${formatCurrency(data.total_revenue - data.total_commission)}`, 20, 105);
    
    // Prepare table data
    const tableData = data.organization_revenues.map(org => [
      org.name,
      org.exam_count.toString(),
      formatCurrency(org.revenue),
      formatCurrency(org.commission),
      formatCurrency(org.revenue - org.commission)
    ]);
    
    // Add organization table
    autoTable(doc, {
      startY: 120,
      head: [['Organization', 'Exams', 'Revenue', 'Commission', 'Net']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229], // Blue color
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Light gray
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 50 }, // Organization name
        1: { cellWidth: 20, halign: 'center' }, // Exams
        2: { cellWidth: 30, halign: 'right' }, // Revenue
        3: { cellWidth: 30, halign: 'right' }, // Commission
        4: { cellWidth: 30, halign: 'right' } // Net
      }
    });
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text("University Grants Commission - Revenue Report", doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
    }
    
      // Save the PDF
      const fileName = `revenue-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      console.log("Saving PDF with filename:", fileName);
      doc.save(fileName);
      console.log("PDF export completed successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const exportExamToPDF = () => {
    console.log("Export Exam PDF button clicked");
    if (!data) {
      console.log("No data available for export");
      alert("No data available for export. Please try again later.");
      return;
    }

    try {
      console.log("Starting Exam PDF generation...");
      const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Revenue Report by Exam", 20, 30);
    
    // Add date and time range
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const currentDate = new Date().toLocaleDateString();
    let timeRangeText = timeRange.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Handle custom date range
    if (timeRange === "custom" && customStartDate && customEndDate) {
      const startDate = new Date(customStartDate).toLocaleDateString();
      const endDate = new Date(customEndDate).toLocaleDateString();
      timeRangeText = `Custom Range: ${startDate} to ${endDate}`;
    }
    
    doc.text(`Generated on: ${currentDate}`, 20, 45);
    doc.text(`Time Range: ${timeRangeText}`, 20, 55);
    
    // Add summary section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 20, 75);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Revenue: ${formatCurrency(data.total_revenue)}`, 20, 85);
    doc.text(`Total Commission: ${formatCurrency(data.total_commission)}`, 20, 95);
    doc.text(`Net Revenue: ${formatCurrency(data.total_revenue - data.total_commission)}`, 20, 105);
    
    // Prepare exam table data
    const examTableData = data.exam_revenues.map(exam => [
      exam.name,
      exam.organization_name,
      exam.attempt_count.toString(),
      formatCurrency(exam.revenue),
      formatCurrency(exam.commission),
      formatCurrency(exam.revenue - exam.commission)
    ]);
    
    // Add exam table
    autoTable(doc, {
      startY: 120,
      head: [['Exam', 'Organization', 'Attempts', 'Revenue', 'Commission', 'Net']],
      body: examTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229], // Blue color
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Light gray
      },
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Exam name
        1: { cellWidth: 35 }, // Organization
        2: { cellWidth: 20, halign: 'center' }, // Attempts
        3: { cellWidth: 25, halign: 'right' }, // Revenue
        4: { cellWidth: 25, halign: 'right' }, // Commission
        5: { cellWidth: 25, halign: 'right' } // Net
      }
    });
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text("University Grants Commission - Revenue Report", doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
    }
    
      // Save the PDF
      const fileName = `exam-revenue-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      console.log("Saving Exam PDF with filename:", fileName);
      doc.save(fileName);
      console.log("Exam PDF export completed successfully");
    } catch (error) {
      console.error("Error generating Exam PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading revenue data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Card className="max-w-md w-full border-red-200 bg-white">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error Loading Revenue Data
            </CardTitle>
            <CardDescription>
              Unable to fetch revenue information from the server
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{error}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> This may be a backend configuration issue. 
                Please ensure the <code className="bg-amber-100 px-1 rounded">/api/admin/revenue</code> endpoint 
                is properly configured with super admin authentication.
              </p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">No data found.</p>
      </div>
    );
  }

  // Guarded local arrays to avoid runtime errors when mapping
  const orgs = data.organization_revenues ?? [];
  const exams = data.exam_revenues ?? [];
  const months = data.monthly_revenues ?? [];
  
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-gray-600 mt-2">Track earnings and commissions</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_quarter">Last Quarter</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          {timeRange === "custom" && (
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {["overview", "organizations", "exams"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" ? "Overview" : tab === "organizations" ? "By Organization" : "By Exam"}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
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
                    <PieChartIcon className="h-8 w-8 text-blue-600" />
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
                <BarChart data={months} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
      {activeTab === "organizations" && (
        <div className="space-y-6">
          {/* Organization Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Distribution Pie Chart */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <PieChartIcon className="h-5 w-5 text-gray-600" />
                  Revenue Distribution
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Revenue share by organization
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orgs.map((org, index) => ({
                          name: org.name,
                          value: org.revenue,
                          fill: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {orgs.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))} 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={60}
                        wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue vs Commission Bar Chart */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <TrendingUp className="h-5 w-5 text-gray-600" />
                  Revenue vs Commission
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Revenue and commission comparison by organization
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={orgs} margin={{ top: 30, right: 40, left: 40, bottom: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={0}
                        textAnchor="middle"
                        height={90}
                        interval={0}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={{ stroke: '#cbd5e1' }}
                      tickFormatter={(value) => {
                        // Split long names into multiple lines (max 25 chars per line)
                        if (value.length <= 25) return value;
                        
                        const words = value.split(' ');
                        const lines = [];
                        let currentLine = '';
                        
                        for (const word of words) {
                          if ((currentLine + ' ' + word).length <= 25) {
                            currentLine = currentLine ? currentLine + ' ' + word : word;
                          } else {
                            if (currentLine) lines.push(currentLine);
                            currentLine = word;
                          }
                        }
                        if (currentLine) lines.push(currentLine);
                        
                        // Limit to 3 lines max
                        return lines.slice(0, 3).join('\n');
                      }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={{ stroke: '#cbd5e1' }} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => `Organization: ${label}`}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="commission" name="Commission" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Organizations Table */}
          <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Building2 className="h-5 w-5 text-gray-600" />
                  Revenue by Organization
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Breakdown of revenue generated by each organization
                </CardDescription>
              </div>
              <Button 
                onClick={exportToPDF}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgs.map((org) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === "exams" && (
        <div className="space-y-6">
          {/* Exam Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Exams */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <TrendingUp className="h-5 w-5 text-gray-600" />
                  Top Revenue Generating Exams
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Highest earning exams by revenue
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={exams.slice(0, 8).sort((a, b) => b.revenue - a.revenue)} 
                      margin={{ top: 30, right: 40, left: 40, bottom: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={0}
                        textAnchor="middle"
                        height={90}
                        interval={0}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={{ stroke: '#cbd5e1' }}
                      tickFormatter={(value) => {
                        // Split long exam names into multiple lines (max 20 chars per line)
                        if (value.length <= 20) return value;
                        
                        const words = value.split(' ');
                        const lines = [];
                        let currentLine = '';
                        
                        for (const word of words) {
                          if ((currentLine + ' ' + word).length <= 20) {
                            currentLine = currentLine ? currentLine + ' ' + word : word;
                          } else {
                            if (currentLine) lines.push(currentLine);
                            currentLine = word;
                          }
                        }
                        if (currentLine) lines.push(currentLine);
                        
                        // Limit to 3 lines max
                        return lines.slice(0, 3).join('\n');
                      }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={{ stroke: '#cbd5e1' }} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => `Exam: ${label}`}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Exam Attempts vs Revenue */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BookOpen className="h-5 w-5 text-gray-600" />
                  Attempts vs Revenue Correlation
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Revenue generated per exam attempt
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={exams.map(exam => ({
                        ...exam,
                        revenuePerAttempt: exam.attempt_count > 0 ? exam.revenue / exam.attempt_count : 0
                      }))} 
                      margin={{ top: 30, right: 40, left: 40, bottom: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={0}
                        textAnchor="middle"
                        height={90}
                        interval={0}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={{ stroke: '#cbd5e1' }}
                      tickFormatter={(value) => {
                        // Split long exam names into multiple lines (max 20 chars per line)
                        if (value.length <= 20) return value;
                        
                        const words = value.split(' ');
                        const lines = [];
                        let currentLine = '';
                        
                        for (const word of words) {
                          if ((currentLine + ' ' + word).length <= 20) {
                            currentLine = currentLine ? currentLine + ' ' + word : word;
                          } else {
                            if (currentLine) lines.push(currentLine);
                            currentLine = word;
                          }
                        }
                        if (currentLine) lines.push(currentLine);
                        
                        // Limit to 3 lines max
                        return lines.slice(0, 3).join('\n');
                      }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={{ stroke: '#cbd5e1' }} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'revenuePerAttempt') {
                          return [formatCurrency(Number(value)), 'Revenue per Attempt'];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Exam: ${label}`}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="attempt_count" name="Attempts" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="revenuePerAttempt" name="Revenue per Attempt" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exams Table */}
          <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BookOpen className="h-5 w-5 text-gray-600" />
                  Revenue by Exam
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Breakdown of revenue generated by each exam
                </CardDescription>
              </div>
              <Button 
                onClick={exportExamToPDF}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  );
}
