import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Users,
  Building,
  Loader2,
  AlertCircle,
  Search,
  Eye
} from "lucide-react";
import axios from 'axios';

interface Location {
  id: number;
  organization_id: number;
  location_name: string;
  capacity: number;
  current_registrations?: number;
  organization?: {
    id: number;
    name: string;
  };
}

interface LocationFormData {
  location_name: string;
  capacity: number;
}

interface LocationFormErrors {
  location_name?: string;
  capacity?: string;
}

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deleteLocationId, setDeleteLocationId] = useState<number | null>(null);
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LocationFormData>({
    location_name: "",
    capacity: 50
  });
  const [formErrors, setFormErrors] = useState<LocationFormErrors>({});

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://localhost:8000/api/admin/locations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      setLocations(response.data.data || response.data);
    } catch (err: any) {
      console.error('Error fetching locations:', err);
      setError('Failed to load locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: LocationFormErrors = {};

    if (!formData.location_name.trim()) {
      errors.location_name = "Location name is required";
    }

    if (formData.capacity < 1) {
      errors.capacity = "Capacity must be at least 1";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      location_name: "",
      capacity: 50
    });
    setFormErrors({});
  };

  const handleCreateLocation = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      console.log('Creating location with data:', formData);
      console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      const response = await axios.post('http://localhost:8000/api/admin/locations', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Location created successfully:', response.data);
      setShowCreateModal(false);
      resetForm();
      await fetchLocations();
    } catch (err: any) {
      console.error('Error creating location:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Handle validation errors
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const validationErrors: LocationFormErrors = {};
        const backendErrors = err.response.data.errors;
        
        if (backendErrors.location_name) {
          validationErrors.location_name = backendErrors.location_name[0];
        }
        if (backendErrors.capacity) {
          validationErrors.capacity = backendErrors.capacity[0];
        }
        
        setFormErrors(validationErrors);
      } else {
        setError(err.response?.data?.message || 'Failed to create location. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLocation = async () => {
    if (!validateForm() || !editingLocation) return;

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`http://localhost:8000/api/admin/locations/${editingLocation.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      setShowEditModal(false);
      setEditingLocation(null);
      resetForm();
      await fetchLocations();
    } catch (err: any) {
      console.error('Error updating location:', err);
      
      // Handle validation errors
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const validationErrors: LocationFormErrors = {};
        const backendErrors = err.response.data.errors;
        
        if (backendErrors.location_name) {
          validationErrors.location_name = backendErrors.location_name[0];
        }
        if (backendErrors.capacity) {
          validationErrors.capacity = backendErrors.capacity[0];
        }
        
        setFormErrors(validationErrors);
      } else if (err.response?.data?.message) {
        if (err.response.data.message.includes('capacity')) {
          setFormErrors({ capacity: err.response.data.message });
        } else {
          setError(err.response.data.message);
        }
      } else {
        setError('Failed to update location. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLocation = async () => {
    if (!deleteLocationId) return;

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`http://localhost:8000/api/admin/locations/${deleteLocationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      setDeleteLocationId(null);
      await fetchLocations();
    } catch (err: any) {
      console.error('Error deleting location:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to delete location. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      location_name: location.location_name,
      capacity: location.capacity
    });
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const filteredLocations = locations.filter(location =>
    location.location_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Locations Management</h1>
              <p className="text-gray-600">Manage exam locations and their capacities</p>
            </div>
          </div>
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError("")}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              ×
            </Button>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-600">
                {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Locations ({filteredLocations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading locations...
              </div>
            ) : filteredLocations.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location Name</TableHead>
                      <TableHead className="text-center">Capacity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocations.map((location) => {
                      return (
                        <TableRow key={location.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="font-medium">{location.location_name}</div>
                                <div className="text-sm text-gray-500">ID: {location.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-mono">
                              {location.capacity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(location)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteLocationId(location.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No locations found</p>
                <p className="text-sm">
                  {searchTerm ? 'Try adjusting your search term' : 'Add your first location to get started'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Location Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Location
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="location_name">Location Name</Label>
                <Input
                  id="location_name"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  placeholder="e.g., Main Hall, Lab Building A"
                  className={formErrors.location_name ? "border-red-300" : ""}
                />
                {formErrors.location_name && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.location_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="Enter maximum capacity"
                  className={formErrors.capacity ? "border-red-300" : ""}
                />
                {formErrors.capacity && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.capacity}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateLocation}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Location
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Location Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Edit Location
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_location_name">Location Name</Label>
                <Input
                  id="edit_location_name"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  placeholder="e.g., Main Hall, Lab Building A"
                  className={formErrors.location_name ? "border-red-300" : ""}
                />
                {formErrors.location_name && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.location_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit_capacity">Capacity</Label>
                <Input
                  id="edit_capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  placeholder="Enter maximum capacity"
                  className={formErrors.capacity ? "border-red-300" : ""}
                />
                {formErrors.capacity && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.capacity}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditLocation}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update Location
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        {deleteLocationId && (
          <ConfirmDialog
            isOpen={!!deleteLocationId}
            title="Delete Location"
            message="Are you sure you want to delete this location? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleDeleteLocation}
            onCancel={() => setDeleteLocationId(null)}
          />
        )}
      </div>
    </div>
  );
}