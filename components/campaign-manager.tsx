"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Play, Pause, Calendar, Users, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import type { Campaign, MessageTemplate, Group } from "@/lib/storage"
import { getCampaigns, addCampaign, updateCampaign, deleteCampaign, getTemplates, getGroups } from "@/lib/storage"

interface CampaignManagerProps {}

export default function CampaignManager({}: CampaignManagerProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(getCampaigns())
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [activeStatus, setActiveStatus] = useState<Campaign['status']>('draft')

  const handleAddCampaign = (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>) => {
    const newCampaign = addCampaign(campaign)
    setCampaigns([...campaigns, newCampaign])
    setIsAddDialogOpen(false)
  }

  const handleEditCampaign = (campaign: Campaign) => {
    const updatedCampaign = updateCampaign(campaign.id, campaign)
    setCampaigns(campaigns.map(c => c.id === campaign.id ? updatedCampaign : c))
    setEditingCampaign(null)
  }

  const handleDeleteCampaign = (id: string) => {
    deleteCampaign(id)
    setCampaigns(campaigns.filter(c => c.id !== id))
  }

  const handleStatusChange = (id: string, status: Campaign['status']) => {
    const updatedCampaign = updateCampaign(id, { status })
    setCampaigns(campaigns.map(c => c.id === id ? updatedCampaign : c))
  }

  const getStatusBadge = (status: Campaign['status']) => {
    const variants = {
      draft: "secondary",
      scheduled: "warning",
      running: "default",
      completed: "success",
      paused: "warning",
      failed: "destructive",
    } as const

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredCampaigns = campaigns.filter(campaign => campaign.status === activeStatus)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campaign Management</CardTitle>
              <CardDescription>Create and manage your messaging campaigns</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                </DialogHeader>
                <CampaignForm onSubmit={handleAddCampaign} onCancel={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeStatus} onValueChange={(value) => setActiveStatus(value as Campaign['status'])}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="running">Running</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeStatus} className="space-y-4">
              {filteredCampaigns.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Target Audience</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(campaign.schedule.startDate).toLocaleDateString()}
                                {campaign.schedule.frequency !== 'once' && ` (${campaign.schedule.frequency})`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>
                                {campaign.targetAudience.type === 'all'
                                  ? 'All Contacts'
                                  : campaign.targetAudience.type === 'group'
                                  ? 'Group'
                                  : 'Filtered'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>
                                  {campaign.metrics.sent} / {campaign.metrics.totalContacts}
                                </span>
                                <span className="text-muted-foreground">
                                  {Math.round((campaign.metrics.sent / campaign.metrics.totalContacts) * 100)}%
                                </span>
                              </div>
                              <Progress
                                value={(campaign.metrics.sent / campaign.metrics.totalContacts) * 100}
                                className="h-2"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {campaign.status === 'draft' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusChange(campaign.id, 'scheduled')}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                              {campaign.status === 'running' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusChange(campaign.id, 'paused')}
                                >
                                  <Pause className="h-4 w-4" />
                                </Button>
                              )}
                              {campaign.status === 'paused' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusChange(campaign.id, 'running')}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingCampaign(campaign)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Campaign</DialogTitle>
                                  </DialogHeader>
                                  {editingCampaign && (
                                    <CampaignForm
                                      initialData={editingCampaign}
                                      onSubmit={handleEditCampaign}
                                      onCancel={() => setEditingCampaign(null)}
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCampaign(campaign.id)}
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
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No campaigns found in this status
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface CampaignFormProps {
  initialData?: Campaign
  onSubmit: (campaign: any) => void
  onCancel: () => void
}

function CampaignForm({ initialData, onSubmit, onCancel }: CampaignFormProps) {
  const templates = getTemplates()
  const groups = getGroups()

  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || "",
    description: initialData?.description || "",
    templateId: initialData?.templateId || "",
    status: initialData?.status || "draft",
    schedule: initialData?.schedule || {
      startDate: new Date().toISOString().split("T")[0],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      frequency: "once" as const,
      timeOfDay: "09:00",
    },
    targetAudience: initialData?.targetAudience || {
      type: "all" as const,
    },
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Campaign Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template">Message Template</Label>
        <Select
          value={formData.templateId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, templateId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Schedule</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.schedule.startDate}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, startDate: e.target.value },
                }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="timeOfDay">Time of Day</Label>
            <Input
              id="timeOfDay"
              type="time"
              value={formData.schedule.timeOfDay}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, timeOfDay: e.target.value },
                }))
              }
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frequency">Frequency</Label>
        <Select
          value={formData.schedule.frequency}
          onValueChange={(value) =>
            setFormData(prev => ({
              ...prev,
              schedule: { ...prev.schedule, frequency: value as Campaign['schedule']['frequency'] },
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once">Once</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Target Audience</Label>
        <Select
          value={formData.targetAudience.type}
          onValueChange={(value) =>
            setFormData(prev => ({
              ...prev,
              targetAudience: { ...prev.targetAudience, type: value as Campaign['targetAudience']['type'] },
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Contacts</SelectItem>
            <SelectItem value="group">Specific Group</SelectItem>
            <SelectItem value="filtered">Filtered Contacts</SelectItem>
          </SelectContent>
        </Select>

        {formData.targetAudience.type === 'group' && (
          <Select
            value={formData.targetAudience.groupId}
            onValueChange={(value) =>
              setFormData(prev => ({
                ...prev,
                targetAudience: { ...prev.targetAudience, groupId: value },
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update" : "Create"} Campaign</Button>
      </div>
    </form>
  )
} 