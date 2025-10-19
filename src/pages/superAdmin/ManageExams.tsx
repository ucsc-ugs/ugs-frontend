import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, BookOpen, Calendar, Filter, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSuperAdminExams } from "@/lib/superAdminApi";

interface Exam {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  organization: {
    id: number;
    name: string;
  };
  is_active: boolean;
  created_at: string;
  registered_students_count?: number; // Keep for backward compatibility
  students_count?: number; // New field from backend
  total_students_enrolled?: number; // Alternative field from backend
  passing_rate?: number; // Optional - may not be available for all exams
}

export default function SuperAdminExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Using centralized Super Admin API service for all exam operations

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Toggle auto refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing exam data...");
      setRefreshKey(prev => prev + 1);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      setError("");
      try {
        // Use the centralized API service
        const response = await getSuperAdminExams();
        
        // Extract data from response - expecting { message: "...", data: [...] }
        const examsData = Array.isArray(response?.data) ? response.data : [];
        
        console.log("✅ Successfully fetched exams:", {
          count: examsData.length,
          firstExam: examsData.length > 0 ? {
            id: examsData[0].id,
            name: examsData[0].name,
            students_count: examsData[0].students_count,
            total_students_enrolled: examsData[0].total_students_enrolled,
            passing_rate: examsData[0].passing_rate
          } : null
        });
        
        setExams(examsData);
        setLastUpdated(new Date());
        
      } catch (err: unknown) {
        console.error("❌ Failed to fetch exams:", err);
        
        // Handle API errors from centralized service
        if (err && typeof err === 'object' && 'message' in err) {
          setError((err as { message: string }).message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred while loading exams");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [refreshKey]);

  // Unique organizations for filter dropdown
  const organizations = Array.from(new Set(exams.map(exam => exam.organization?.name).filter(Boolean)));

  // Note: Exam status toggle functionality can be implemented using updateSuperAdminExamStatus from the API service

  // Export functionality
  const handleExportData = () => {
    try {
      // Check if there's data to export
      if (filteredExams.length === 0) {
        alert('No exam data available to export');
        return;
      }

      // Prepare data for export with comprehensive information
      const exportData = filteredExams.map(exam => ({
        'Exam ID': exam.id,
        'Exam Name': exam.name,
        'Organization': exam.organization.name,
        'Description': exam.description || 'N/A',
        'Price (LKR)': exam.price,
        'Duration (minutes)': exam.duration,
        'Students Enrolled': exam.students_count || exam.total_students_enrolled || exam.registered_students_count || 0,
        'Pass Rate (%)': exam.passing_rate !== undefined && exam.passing_rate !== null ? `${exam.passing_rate.toFixed(1)}%` : 'N/A',
        'Status': exam.is_active ? 'Active' : 'Inactive',
        'Created Date': new Date(exam.created_at).toLocaleDateString('en-LK'),
        'Created Time': new Date(exam.created_at).toLocaleTimeString('en-LK'),
        'Organization ID': exam.organization.id
      }));

      // Convert to CSV with proper escaping
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        // Add BOM for proper UTF-8 handling in Excel
        '\uFEFF',
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas, quotes, and newlines in CSV
            if (typeof value === 'string') {
              if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                return `"${value.replace(/"/g, '""')}"`;
              }
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Generate filename with timestamp and filter info
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filterSuffix = organizationFilter !== 'all' ? `-${organizationFilter.replace(/[^a-zA-Z0-9]/g, '')}` : '';
      const searchSuffix = searchTerm ? `-search` : '';
      const filename = `super-admin-exams${filterSuffix}${searchSuffix}-${timestamp}.csv`;
      link.setAttribute('download', filename);
      
      // Trigger download
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      console.log(`✅ Successfully exported ${exportData.length} exams to ${filename}`);
      
      // Show success message
      const message = `Successfully exported ${exportData.length} exam${exportData.length === 1 ? '' : 's'} to CSV file`;
      // You can replace alert with a toast notification if available
      alert(message);
      
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch =
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOrganization =
      organizationFilter === "all" || exam.organization.name === organizationFilter;

    return matchesSearch && matchesOrganization;
  });

  // Debug logging for filter functionality
  console.log("🔍 Filter Debug:", {
    totalExams: exams.length,
    filteredExams: filteredExams.length,
    organizationFilter,
    searchTerm,
    availableOrganizations: organizations
  });

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading exams…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Exams</h1>
          <p className="text-gray-600 mt-2">View and manage all exams in the system</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4 md:space-y-0 md:flex md:space-x-4">
          <div className="relative md:flex-[2] flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search exams by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <div className="flex space-x-2">
            <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
              <SelectTrigger className="w-[220px]">
                <Filter className="h-4 w-4 text-gray-400 mr-2" />
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map(org => (
                  <SelectItem key={org} value={org}>{org}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(organizationFilter !== "all" || searchTerm) && (
              <Button 
                variant="outline" 
                size="default"
                onClick={() => {
                  setOrganizationFilter("all");
                  setSearchTerm("");
                }}
                className="gap-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exams Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <BookOpen className="h-5 w-5 text-gray-600" />
                Exams ({filteredExams.length})
              </CardTitle>
              <CardDescription className="text-gray-600 flex flex-wrap items-center gap-2">
                <span>Showing {filteredExams.length} of {exams.length} total exams</span>
                {organizationFilter !== "all" && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300 font-semibold px-3 py-1 shadow-sm">
                    🏢 Filtered by: {organizationFilter}
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300 font-semibold px-3 py-1 shadow-sm">
                    🔍 Search: "{searchTerm}"
                  </Badge>
                )}
                {lastUpdated && (
                  <span className="text-xs text-gray-500">
                    • Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={autoRefresh ? "default" : "outline"} 
                className="gap-2" 
                onClick={toggleAutoRefresh}
              >
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
                Refresh Now
              </Button>
              <Button 
                variant="outline" 
                className="gap-2" 
                onClick={handleExportData}
                disabled={loading || filteredExams.length === 0}
                title={filteredExams.length === 0 ? "No data to export" : `Export ${filteredExams.length} exams to CSV`}
              >
                <Plus className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExams.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No exams found matching your criteria</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Price (LKR)</TableHead>              
                  <TableHead>Students</TableHead>
                  <TableHead>Pass Rate</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        {exam.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{exam.organization.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {exam.price.toLocaleString('en-LK')} LKR
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-center">
                        <div className="font-semibold text-lg">
                          {exam.students_count || exam.total_students_enrolled || exam.registered_students_count || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          students enrolled
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {exam.passing_rate !== undefined && exam.passing_rate !== null ? (
                          <>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  exam.passing_rate > 70 ? 'bg-green-600' : 
                                  exam.passing_rate > 50 ? 'bg-yellow-500' : 'bg-red-600'
                                }`} 
                                style={{ width: `${Math.min(100, Math.max(0, exam.passing_rate))}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{exam.passing_rate.toFixed(1)}%</span>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                              <div className="h-2.5 rounded-full bg-gray-400 w-0"></div>
                            </div>
                            <span className="text-sm text-gray-500">N/A</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(exam.created_at).toLocaleDateString('en-LK')}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}