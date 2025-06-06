'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';

type CreatorStatus = 'SELECTED' | 'PITCHED' | 'AGREEMENT' | 'PUBLISHED';

interface Creator {
  id: string;
  name: string;
  channelId: string;
  email?: string;
  status: CreatorStatus;
  pitchNotes?: any;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  SELECTED: { label: 'Selected', color: 'bg-blue-100 text-blue-800', description: 'Researching & selected' },
  PITCHED: { label: 'Pitched', color: 'bg-yellow-100 text-yellow-800', description: 'Pitch sent to creator' },
  AGREEMENT: { label: 'Agreement', color: 'bg-purple-100 text-purple-800', description: 'In negotiation' },
  PUBLISHED: { label: 'Published', color: 'bg-green-100 text-green-800', description: 'Video is live' },
};

export default function CreatorCRMPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state for new/edit creator
  const [formData, setFormData] = useState({
    name: '',
    channelId: '',
    email: '',
    status: 'SELECTED' as CreatorStatus,
  });

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const response = await fetch('/api/creators');
      if (response.ok) {
        const data = await response.json();
        setCreators(data);
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCreator = async () => {
    try {
      const response = await fetch('/api/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCreator = await response.json();
        setCreators([...creators, newCreator]);
        setIsCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating creator:', error);
    }
  };

  const handleUpdateCreator = async () => {
    if (!selectedCreator) return;

    try {
      const response = await fetch(`/api/creators/${selectedCreator.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedCreator = await response.json();
        setCreators(creators.map(c => c.id === selectedCreator.id ? updatedCreator : c));
        setIsEditDialogOpen(false);
        setSelectedCreator(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating creator:', error);
    }
  };

  const handleDeleteCreator = async (id: string) => {
    try {
      const response = await fetch(`/api/creators/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCreators(creators.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting creator:', error);
    }
  };

  const handleStatusChange = async (creatorId: string, newStatus: CreatorStatus) => {
    try {
      const response = await fetch(`/api/creators/${creatorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedCreator = await response.json();
        setCreators(creators.map(c => c.id === creatorId ? updatedCreator : c));
      }
    } catch (error) {
      console.error('Error updating creator status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      channelId: '',
      email: '',
      status: 'SELECTED',
    });
  };

  const openEditDialog = (creator: Creator) => {
    setSelectedCreator(creator);
    setFormData({
      name: creator.name,
      channelId: creator.channelId,
      email: creator.email || '',
      status: creator.status,
    });
    setIsEditDialogOpen(true);
  };

  const getCreatorsByStatus = (status: CreatorStatus) => {
    return creators.filter(creator => creator.status === status);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Creator CRM</h1>
            <p className="text-gray-600 mt-1">Track your YouTube creator outreach pipeline</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Creator
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.keys(statusConfig) as CreatorStatus[]).map((status) => {
            const statusCreators = getCreatorsByStatus(status);
            const config = statusConfig[status];

            return (
              <div key={status} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{config.label}</h3>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {statusCreators.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {statusCreators.map((creator) => (
                    <Card key={creator.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={`https://img.youtube.com/vi/${creator.channelId}/default.jpg`} />
                              <AvatarFallback>{getInitials(creator.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm font-medium truncate">
                                {creator.name}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {creator.email || creator.channelId}
                              </CardDescription>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(creator)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => window.open(`https://youtube.com/channel/${creator.channelId}`, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Channel
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCreator(creator.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <Select 
                            value={creator.status} 
                            onValueChange={(value: CreatorStatus) => handleStatusChange(creator.id, value)}
                          >
                            <SelectTrigger className="w-full h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.entries(statusConfig) as [CreatorStatus, typeof statusConfig[CreatorStatus]][]).map(([status, config]) => (
                                <SelectItem key={status} value={status}>
                                  <Badge className={`${config.color} text-xs`}>
                                    {config.label}
                                  </Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-500">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>Added {new Date(creator.createdAt).toLocaleDateString()}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Created: {new Date(creator.createdAt).toLocaleString()}</p>
                              <p>Updated: {new Date(creator.updatedAt).toLocaleString()}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Creator Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Creator</DialogTitle>
              <DialogDescription>
                Add a YouTube creator to your CRM pipeline.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Creator Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Tech Reviewer"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="channelId">Channel ID</Label>
                <Input
                  id="channelId"
                  value={formData.channelId}
                  onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                  placeholder="e.g., UCxxxxxxxxxxxxxx"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="creator@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select value={formData.status} onValueChange={(value: CreatorStatus) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(statusConfig) as [CreatorStatus, typeof statusConfig[CreatorStatus]][]).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCreator}>Add Creator</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Creator Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Creator</DialogTitle>
              <DialogDescription>
                Update creator information and status.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Creator Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-channelId">Channel ID</Label>
                <Input
                  id="edit-channelId"
                  value={formData.channelId}
                  onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: CreatorStatus) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(statusConfig) as [CreatorStatus, typeof statusConfig[CreatorStatus]][]).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCreator}>Update Creator</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
