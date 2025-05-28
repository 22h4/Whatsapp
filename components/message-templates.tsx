"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react"
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
import type { MessageTemplate } from "@/lib/storage"
import { getTemplates, addTemplate, updateTemplate, deleteTemplate } from "@/lib/storage"

interface MessageTemplatesProps {
  onNotification: (notification: any) => void
}

export default function MessageTemplates({ onNotification }: MessageTemplatesProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>(getTemplates())
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<MessageTemplate['category']>('marketing')

  const handleAddTemplate = (template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate = addTemplate(template)
    setTemplates([...templates, newTemplate])
    setIsAddDialogOpen(false)
    onNotification({
      type: "success",
      title: "Template Added",
      message: "Message template created successfully",
    })
  }

  const handleEditTemplate = (template: MessageTemplate) => {
    const updatedTemplate = updateTemplate(template.id, template)
    setTemplates(templates.map(t => t.id === template.id ? updatedTemplate : t))
    setEditingTemplate(null)
    onNotification({
      type: "success",
      title: "Template Updated",
      message: "Message template updated successfully",
    })
  }

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id)
    setTemplates(templates.filter(t => t.id !== id))
    onNotification({
      type: "success",
      title: "Template Deleted",
      message: "Message template deleted successfully",
    })
  }

  const getStatusBadge = (status: MessageTemplate['status']) => {
    const variants = {
      draft: "secondary",
      pending: "warning",
      approved: "success",
      rejected: "destructive",
    } as const

    const icons = {
      draft: <Clock className="h-4 w-4" />,
      pending: <Clock className="h-4 w-4" />,
      approved: <CheckCircle className="h-4 w-4" />,
      rejected: <XCircle className="h-4 w-4" />,
    }

    return (
      <Badge variant={variants[status]} className="flex items-center space-x-1">
        {icons[status]}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </Badge>
    )
  }

  const filteredTemplates = templates.filter(template => template.category === activeCategory)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>Create and manage message templates for your campaigns</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Template</DialogTitle>
                </DialogHeader>
                <TemplateForm onSubmit={handleAddTemplate} onCancel={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as MessageTemplate['category'])}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
              <TabsTrigger value="notification">Notifications</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory} className="space-y-4">
              {filteredTemplates.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead>Variables</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>{getStatusBadge(template.status)}</TableCell>
                          <TableCell>{template.language}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {template.variables.map((variable) => (
                                <Badge key={variable} variant="outline">
                                  {variable}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(template.updatedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingTemplate(template)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Template</DialogTitle>
                                  </DialogHeader>
                                  {editingTemplate && (
                                    <TemplateForm
                                      initialData={editingTemplate}
                                      onSubmit={handleEditTemplate}
                                      onCancel={() => setEditingTemplate(null)}
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTemplate(template.id)}
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
                  No templates found in this category
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface TemplateFormProps {
  initialData?: MessageTemplate
  onSubmit: (template: any) => void
  onCancel: () => void
}

function TemplateForm({ initialData, onSubmit, onCancel }: TemplateFormProps) {
  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || "",
    content: initialData?.content || "",
    category: initialData?.category || "marketing",
    language: initialData?.language || "en",
    status: initialData?.status || "draft",
    variables: initialData?.variables || [],
    description: initialData?.description || "",
    tags: initialData?.tags || [],
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const extractVariables = (content: string) => {
    const matches = content.match(/\{([^}]+)\}/g) || []
    return matches.map(match => match.slice(1, -1))
  }

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content,
      variables: extractVariables(content),
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Template Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as MessageTemplate['category'] }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select
          value={formData.language}
          onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Message Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleContentChange(e.target.value)}
          rows={4}
          required
          placeholder="Use {variable} for dynamic content"
        />
        {formData.variables.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {formData.variables.map((variable) => (
              <Badge key={variable} variant="outline">
                {variable}
              </Badge>
            ))}
          </div>
        )}
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

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update" : "Add"} Template</Button>
      </div>
    </form>
  )
} 