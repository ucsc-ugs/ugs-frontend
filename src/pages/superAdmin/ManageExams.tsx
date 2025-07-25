import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash2, Plus, BookOpen, Clock, Calendar, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  total_students: number;
  passing_rate: number;
}

export default function SuperAdminExams() {
  // Dummy data
  const dummyExams: Exam[] = [
    {
      id: 1,
      name: "GCAT",
      description: "General Computer Aptitude Test",
      price: 3000,
      duration: 90,
      organization: { id: 1, name: "UCSC" },
      is_active: true,
      created_at: "2023-10-15T09:30:00Z",
      total_students: 150,
      passing_rate: 72
    },
    {
      id: 2,
      name: "GCCT",
      description: "General Computer Competency Test",
      price: 3000,
      duration: 120,
      organization: { id: 2, name: "UCSC" },
      is_active: true,
      created_at: "2023-09-22T14:15:00Z",
      total_students: 210,
      passing_rate: 68
    },
    {
      id: 3,
      name: "FIT",
      description: "Foundation in IT",
      price: 3000,
      duration: 60,
      organization: { id: 3, name: "IIT" },
      is_active: false,
      created_at: "2023-11-05T10:45:00Z",
      total_students: 95,
      passing_rate: 81
    },
    {
      id: 4,
      name: "AIT",
      description: "Advanced IT Certification",
      price: 4500,
      duration: 180,
      organization: { id: 1, name: "UCSC" },
      is_active: true,
      created_at: "2023-12-10T11:20:00Z",
      total_students: 75,
      passing_rate: 65
    },
  ];

  const [exams, setExams] = useState<Exam[]>(dummyExams);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteExamId, setDeleteExamId] = useState<number | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [organizationFilter, setOrganizationFilter] = useState<string>("all");

  // Get unique organizations for filter dropdown
  const organizations = Array.from(new Set(exams.map(exam => exam.organization.name)));

  const handleStatusChange = (examId: number, newStatus: boolean) => {
    setExams(exams.map(exam => 
      exam.id === examId ? { ...exam, is_active: newStatus } : exam
    ));
  };

  const handleDelete = () => {
    if (!deleteExamId) return;
    setExams(exams.filter(exam => exam.id !== deleteExamId));
    setDeleteExamId(null);
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && exam.is_active) || 
                         (statusFilter === "inactive" && !exam.is_active);
    
    const matchesOrganization = organizationFilter === "all" || 
                               exam.organization.name === organizationFilter;
    
    return matchesSearch && matchesStatus && matchesOrganization;
  });

  const toggleExamStatus = (examId: number) => {
    setExams(exams.map(exam => 
      exam.id === examId ? { ...exam, is_active: !exam.is_active } : exam
    ));
  };

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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search exams by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Filter by organization" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map(org => (
                  <SelectItem key={org} value={org}>{org}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
              <CardDescription className="text-gray-600">
                Showing {filteredExams.length} of {exams.length} total exams
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Export Data
            </Button>
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
                  <TableHead>Duration</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Pass Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
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
                      <p className="text-sm text-gray-500 mt-1">{exam.description}</p>
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
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        {exam.duration} mins
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        {exam.total_students}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              exam.passing_rate > 70 ? 'bg-green-600' : 
                              exam.passing_rate > 50 ? 'bg-yellow-500' : 'bg-red-600'
                            }`} 
                            style={{ width: `${exam.passing_rate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{exam.passing_rate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={exam.is_active ? "default" : "secondary"}
                        size="sm"
                        onClick={() => toggleExamStatus(exam.id)}
                        className="w-24"
                      >
                        {exam.is_active ? "Active" : "Inactive"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(exam.created_at).toLocaleDateString('en-LK')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingExam(exam)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteExamId(exam.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      {deleteExamId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Delete Exam</CardTitle>
              <CardDescription className="text-gray-600">
                Are you sure you want to delete this exam? This will remove all associated data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Delete Exam
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeleteExamId(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}