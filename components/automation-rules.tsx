"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Clock, MessageSquare, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getTemplates, getActiveTab, setActiveTab } from "@/lib/storage"
import type { MessageTemplate } from "@/lib/storage"

interface AutomationRule {
  id: string
  name: string
  description: string
  type: "time" | "message" | "event"
  status: "active" | "inactive"
  trigger: {
    type: "time" | "message" | "event"
    time?: {
      days: string[]
      time: string
      timezone: string
    }
    message?: {
      keywords: string[]
      matchType: "any" | "all"
    }
    event?: {
      type: "contact_added" | "contact_removed" | "group_created" | "group_deleted"
    }
  }
  action: {
    type: "send_message" | "add_to_group" | "remove_from_group" | "send_notification"
    templateId?: string
    groupId?: string
    message?: string
  }
  createdAt: string
  updatedAt: string
}

interface AutomationRulesProps {}

export default function AutomationRules({}: AutomationRulesProps) {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [activeType, setActiveType] = useState<AutomationRule['type']>("time")
  const [templates, setTemplates] = useState<MessageTemplate[]>([])

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const loadedTemplates = await getTemplates();
        setTemplates(loadedTemplates);
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    };
    loadTemplates();
  }, []);

  const handleAddRule = (rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRule: AutomationRule = {
      ...rule,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setRules([...rules, newRule])
    setIsAddDialogOpen(false)
  }

  const handleEditRule = (rule: AutomationRule) => {
    const updatedRule = {
      ...rule,
      updatedAt: new Date().toISOString(),
    }
    setRules(rules.map(r => r.id === rule.id ? updatedRule : r))
    setEditingRule(null)
  }

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id))
  }

  const handleToggleStatus = (id: string, status: AutomationRule['status']) => {
    const updatedRule = {
      ...rules.find(r => r.id === id)!,
      status,
      updatedAt: new Date().toISOString(),
    }
    setRules(rules.map(r => r.id === id ? updatedRule : r))
  }

  const getStatusBadge = (status: AutomationRule['status']) => {
    return (
      <Badge variant={status === 'active' ? 'default' : 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredRules = rules.filter(rule => rule.type === activeType)

  const getEventType = (event: { type: "contact_added" | "contact_removed" | "group_created" | "group_deleted" } | undefined) => {
    return event?.type ?? '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Automation Rules</CardTitle>
              <CardDescription>Create and manage automated responses and triggers</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Rule</DialogTitle>
                </DialogHeader>
                <RuleForm onSubmit={handleAddRule} onCancel={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeType} onValueChange={(value) => setActiveType(value as AutomationRule['type'])}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="time">
                <Clock className="h-4 w-4 mr-2" />
                Time-based
              </TabsTrigger>
              <TabsTrigger value="message">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message-based
              </TabsTrigger>
              <TabsTrigger value="event">
                <Bell className="h-4 w-4 mr-2" />
                Event-based
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeType} className="space-y-4">
              {filteredRules.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.name}</TableCell>
                          <TableCell>{getStatusBadge(rule.status)}</TableCell>
                          <TableCell>
                            {rule.trigger.type === 'time' && (
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {rule.trigger.time?.days.join(', ')} at {rule.trigger.time?.time}
                                </span>
                              </div>
                            )}
                            {rule.trigger.type === 'message' && (
                              <div className="flex items-center space-x-2">
                                <MessageSquare className="h-4 w-4" />
                                <span>
                                  Keywords: {rule.trigger.message?.keywords.join(', ')}
                                </span>
                              </div>
                            )}
                            {rule.trigger.type === 'event' && rule.trigger.event && (
                              <div className="flex items-center space-x-2">
                                <Bell className="h-4 w-4" />
                                <span>
                                  {getEventType(rule.trigger.event as { type: "contact_added" | "contact_removed" | "group_created" | "group_deleted" })}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {rule.action.type === 'send_message' && 'Send Message'}
                            {rule.action.type === 'add_to_group' && 'Add to Group'}
                            {rule.action.type === 'remove_from_group' && 'Remove from Group'}
                            {rule.action.type === 'send_notification' && 'Send Notification'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Switch
                                checked={rule.status === 'active'}
                                onCheckedChange={(checked) =>
                                  handleToggleStatus(rule.id, checked ? 'active' : 'inactive')
                                }
                              />
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingRule(rule)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Rule</DialogTitle>
                                  </DialogHeader>
                                  {editingRule && (
                                    <RuleForm
                                      initialData={editingRule}
                                      onSubmit={handleEditRule}
                                      onCancel={() => setEditingRule(null)}
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRule(rule.id)}
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
                  No rules found for this type
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface RuleFormProps {
  initialData?: AutomationRule
  onSubmit: (rule: any) => void
  onCancel: () => void
}

function RuleForm({ initialData, onSubmit, onCancel }: RuleFormProps) {
  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || "",
    description: initialData?.description || "",
    type: initialData?.type || "time",
    status: initialData?.status || "active",
    trigger: initialData?.trigger || {
      type: "time",
      time: {
        days: [],
        time: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    },
    action: initialData?.action || {
      type: "send_message",
      templateId: "",
    },
  }))

  const [availableTemplates, setAvailableTemplates] = useState<MessageTemplate[]>([])

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const loadedTemplates = await getTemplates()
        setAvailableTemplates(loadedTemplates)
      } catch (error) {
        console.error('Failed to load templates:', error)
      }
    }
    loadTemplates()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Rule Name</Label>
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
        <Label>Rule Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData(prev => ({
              ...prev,
              type: value as AutomationRule['type'],
              trigger: {
                type: value as AutomationRule['trigger']['type'],
                ...(value === 'time' && {
                  time: {
                    days: [],
                    time: "09:00",
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  },
                }),
                ...(value === 'message' && {
                  message: {
                    keywords: [],
                    matchType: "any",
                  },
                }),
                ...(value === 'event' && {
                  event: {
                    type: "contact_added",
                  },
                }),
              },
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="time">Time-based</SelectItem>
            <SelectItem value="message">Message-based</SelectItem>
            <SelectItem value="event">Event-based</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type === 'time' && (
        <div className="space-y-2">
          <Label>Schedule</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.trigger.time?.time}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    trigger: {
                      ...prev.trigger,
                      time: { ...prev.trigger.time!, time: e.target.value },
                    },
                  }))
                }
                required
              />
            </div>
          </div>
        </div>
      )}

      {formData.type === 'message' && (
        <div className="space-y-2">
          <Label>Message Trigger</Label>
          <div>
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={formData.trigger.message?.keywords.join(', ')}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  trigger: {
                    ...prev.trigger,
                    message: {
                      ...prev.trigger.message!,
                      keywords: e.target.value.split(',').map(k => k.trim()),
                    },
                  },
                }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="matchType">Match Type</Label>
            <Select
              value={formData.trigger.message?.matchType}
              onValueChange={(value) =>
                setFormData(prev => ({
                  ...prev,
                  trigger: {
                    ...prev.trigger,
                    message: {
                      ...prev.trigger.message!,
                      matchType: value as "any" | "all",
                    },
                  },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any keyword</SelectItem>
                <SelectItem value="all">All keywords</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {formData.type === 'event' && (
        <div className="space-y-2">
          <Label>Event Type</Label>
          <Select
            value={formData.trigger.event?.type}
            onValueChange={(value) =>
              setFormData(prev => ({
                ...prev,
                trigger: {
                  ...prev.trigger,
                  event: {
                    type: value as AutomationRule['trigger']['event']['type'],
                  },
                },
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contact_added">Contact Added</SelectItem>
              <SelectItem value="contact_removed">Contact Removed</SelectItem>
              <SelectItem value="group_created">Group Created</SelectItem>
              <SelectItem value="group_deleted">Group Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Action</Label>
        <Select
          value={formData.action.type}
          onValueChange={(value) =>
            setFormData(prev => ({
              ...prev,
              action: {
                type: value as AutomationRule['action']['type'],
                ...(value === 'send_message' && { templateId: "" }),
                ...(value === 'add_to_group' && { groupId: "" }),
                ...(value === 'remove_from_group' && { groupId: "" }),
                ...(value === 'send_notification' && { message: "" }),
              },
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="send_message">Send Message</SelectItem>
            <SelectItem value="add_to_group">Add to Group</SelectItem>
            <SelectItem value="remove_from_group">Remove from Group</SelectItem>
            <SelectItem value="send_notification">Send Notification</SelectItem>
          </SelectContent>
        </Select>

        {formData.action.type === 'send_message' && (
          <div className="space-y-2">
            <Label htmlFor="templateId">Message Template</Label>
            <Select
              value={formData.action.templateId}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  action: { ...prev.action, templateId: value },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.map((template: MessageTemplate) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {formData.action.type === 'send_notification' && (
          <Textarea
            value={formData.action.message}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                action: { ...prev.action, message: e.target.value },
              }))
            }
            placeholder="Enter notification message"
            required
          />
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update" : "Create"} Rule</Button>
      </div>
    </form>
  )
} 