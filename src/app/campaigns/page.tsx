'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Eye, MessageCircle, ExternalLink, Plus, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Creator {
  id: string;
  name: string;
  channelId: string;
}

interface Campaign {
  id: string;
  videoId: string;
  title: string;
  wentLiveAt: string;
  costUsd?: number;
  creator: Creator;
  snapshots: Array<{
    views: number;
    comments: number;
    capturedAt: string;
  }>;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    videoUrl: '',
    creatorId: '',
    wentLiveAt: '',
    costUsd: ''
  });

  // Fetch campaigns and creators
  useEffect(() => {
    Promise.all([
      fetch('/api/campaigns').then(res => res.json()),
      fetch('/api/creators').then(res => res.json())
    ]).then(([campaignsData, creatorsData]) => {
      setCampaigns(campaignsData);
      setCreators(creatorsData);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: formData.videoUrl,
          creatorId: formData.creatorId,
          wentLiveAt: formData.wentLiveAt || undefined,
          costUsd: formData.costUsd ? parseFloat(formData.costUsd) : undefined
        })
      });

      if (response.ok) {
        // Refresh campaigns
        const updatedCampaigns = await fetch('/api/campaigns').then(res => res.json());
        setCampaigns(updatedCampaigns);
        setDialogOpen(false);
        setFormData({ videoUrl: '', creatorId: '', wentLiveAt: '', costUsd: '' });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">YouTube Campaigns</h1>
        <div className="text-center py-12">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">YouTube Campaigns</h1>
          <p className="text-gray-600 mt-2">Track sponsored video performance</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Campaign</DialogTitle>
              <DialogDescription>
                Track a new sponsored video campaign by providing the YouTube video URL.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">YouTube Video URL or ID</Label>
                <Input
                  id="videoUrl"
                  placeholder="https://youtube.com/watch?v=... or video ID"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="creatorId">Creator</Label>
                <Select value={formData.creatorId} onValueChange={(value) => setFormData(prev => ({ ...prev, creatorId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a creator" />
                  </SelectTrigger>
                  <SelectContent>
                    {creators.map((creator) => (
                      <SelectItem key={creator.id} value={creator.id}>
                        {creator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wentLiveAt">Publish Date (optional)</Label>
                <Input
                  id="wentLiveAt"
                  type="date"
                  value={formData.wentLiveAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, wentLiveAt: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costUsd">Campaign Cost USD (optional)</Label>
                <Input
                  id="costUsd"
                  type="number"
                  placeholder="1000"
                  step="0.01"
                  value={formData.costUsd}
                  onChange={(e) => setFormData(prev => ({ ...prev, costUsd: e.target.value }))}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Campaign
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                No campaigns yet
              </h2>
              <p className="text-gray-500 mb-4">
                Add your first sponsored video campaign to start tracking performance.
              </p>
              <p className="text-sm text-gray-400">
                Try these example Inngest-sponsored videos:
              </p>
              <div className="text-xs text-gray-400 mt-2">
                <div>• https://www.youtube.com/watch?v=GQVllWnxamc</div>
                <div>• https://www.youtube.com/watch?v=CvFA6R1l1Gc</div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const latestSnapshot = campaign.snapshots[0];
            
            return (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{campaign.title}</CardTitle>
                      <CardDescription className="mt-1">
                        by {campaign.creator.name}
                      </CardDescription>
                    </div>
                    <a
                      href={`https://youtube.com/watch?v=${campaign.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 p-1 hover:bg-gray-100 rounded"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {latestSnapshot && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium">
                            {latestSnapshot.views.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">views</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="text-sm font-medium">
                            {latestSnapshot.comments.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">comments</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(campaign.wentLiveAt).toLocaleDateString()}</span>
                    </div>
                    
                    {campaign.costUsd && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>${campaign.costUsd.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {latestSnapshot && (
                    <div className="text-xs text-gray-400">
                      Last updated: {new Date(latestSnapshot.capturedAt).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
