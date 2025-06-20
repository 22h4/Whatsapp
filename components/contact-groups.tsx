"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Users, Edit, Trash2, UserPlus, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useMobile } from "@/hooks/use-mobile"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Contact {
  id: string
  name: string
  phone: string
  [key: string]: string
}

interface ContactGroup {
  id: string
  name: string
  description?: string
  contactIds: string[]
  createdAt: string
  updatedAt: string
  color: string
}

interface ContactGroupsProps {
  groups: ContactGroup[]
  onGroupsUpdate: (groups: ContactGroup[]) => void
}

export default function ContactGroups({ groups, onGroupsUpdate }: ContactGroupsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const isMobile = useMobile()

  const colors = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-purple-100 text-purple-800",
    "bg-orange-100 text-orange-800",
    "bg-pink-100 text-pink-800",
    "bg-indigo-100 text-indigo-800",
  ]

  const createGroup = (groupData: Omit<ContactGroup, "id" | "createdAt">) => {
    const newGroup: ContactGroup = {
      ...groupData,
      id: `group_${Date.now()}`,
      createdAt: new Date().toISOString(),
      color: groupData.color || "bg-blue-100 text-blue-800"
    }
    onGroupsUpdate([...groups, newGroup])
    setIsCreateDialogOpen(false)
  }

  const updateGroup = (updatedGroup: ContactGroup) => {
    onGroupsUpdate(groups.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)))
    setEditingGroup(null)
  }

  const deleteGroup = (groupId: string) => {
    onGroupsUpdate(groups.filter((group) => group.id !== groupId))
  }

  const addContactsToGroup = (groupId: string, contactIds: string[]) => {
    onGroupsUpdate(
      groups.map((group) =>
        group.id === groupId ? { ...group, contactIds: [...new Set([...group.contactIds, ...contactIds])] } : group,
      ),
    )
    setSelectedContacts([])
  }

  const removeContactFromGroup = (groupId: string, contactId: string) => {
    onGroupsUpdate(
      groups.map((group) =>
        group.id === groupId ? { ...group, contactIds: group.contactIds.filter((id) => id !== contactId) } : group,
      ),
    )
  }

  const getGroupContacts = (group: ContactGroup) => {
    const groupContacts = groups.find((g) => g.id === group.id)?.contactIds
    return groupContacts?.map((id) => groups.find((g) => g.id === id)) || []
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Contact Groups</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <GroupForm groups={groups} onSubmit={createGroup} onCancel={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {groups.map((group) => (
            <Card key={group.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-medium">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
                <div className="flex space-x-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setEditingGroup(group)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Group</DialogTitle>
                      </DialogHeader>
                      {editingGroup && (
                        <GroupForm
                          groups={groups}
                          initialData={editingGroup}
                          onSubmit={updateGroup}
                          onCancel={() => setEditingGroup(null)}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm" onClick={() => deleteGroup(group.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Badge className={group.color}>{getGroupContacts(group)?.length} contacts</Badge>
                <span className="text-xs text-muted-foreground">{group.createdAt}</span>
              </div>
            </Card>
          ))}
        </div>

        {groups.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No groups yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create groups to organize your contacts</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Group
            </Button>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contact Groups</CardTitle>
              <CardDescription>Organize your contacts into groups for targeted messaging</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <GroupForm groups={groups} onSubmit={createGroup} onCancel={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription className="text-sm">{group.description}</CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setEditingGroup(group)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Group</DialogTitle>
                            </DialogHeader>
                            {editingGroup && (
                              <GroupForm
                                groups={groups}
                                initialData={editingGroup}
                                onSubmit={updateGroup}
                                onCancel={() => setEditingGroup(null)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGroup(group.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Badge className={group.color}>
                          <Users className="h-3 w-3 mr-1" />
                          {getGroupContacts(group)?.length} contacts
                        </Badge>
                        <span className="text-xs text-muted-foreground">{group.createdAt}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Contacts:</span>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <UserPlus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Contacts to {group.name}</DialogTitle>
                              </DialogHeader>
                              <ContactSelector
                                groups={groups}
                                excludeIds={group.contactIds}
                                selectedIds={selectedContacts}
                                onSelectionChange={setSelectedContacts}
                                onAdd={() => addContactsToGroup(group.id, selectedContacts)}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>

                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {getGroupContacts(group)?.slice(0, 5).map((contact) => (
                            <div key={contact?.id} className="flex justify-between items-center text-sm">
                              <span className="truncate">{contact?.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeContactFromGroup(group.id, contact?.id || "")}
                                className="h-6 w-6 p-0 text-red-600"
                              >
                                <UserMinus className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {getGroupContacts(group)?.length > 5 && (
                            <div className="text-xs text-muted-foreground">
                              +{getGroupContacts(group)?.length - 5} more contacts
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No groups created yet</h3>
              <p className="text-muted-foreground mb-6">
                Create groups to organize your contacts for targeted messaging campaigns
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Group
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface GroupFormProps {
  groups: ContactGroup[]
  initialData?: ContactGroup
  onSubmit: (data: any) => void
  onCancel: () => void
}

function GroupForm({ groups, initialData, onSubmit, onCancel }: GroupFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [selectedColor, setSelectedColor] = useState(initialData?.color || "bg-blue-100 text-blue-800")

  const colors = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-purple-100 text-purple-800",
    "bg-orange-100 text-orange-800",
    "bg-pink-100 text-pink-800",
    "bg-indigo-100 text-indigo-800",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (initialData) {
      onSubmit({
        ...initialData,
        name,
        description,
        color: selectedColor,
      })
    } else {
      onSubmit({
        name,
        description,
        color: selectedColor,
        contactIds: [],
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Group Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter group name"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter group description"
        />
      </div>

      <div>
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full border-2 ${color} ${
                selectedColor === color ? "border-gray-800" : "border-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name}>
          {initialData ? "Update" : "Create"} Group
        </Button>
      </div>
    </form>
  )
}

interface ContactSelectorProps {
  groups: ContactGroup[]
  excludeIds: string[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onAdd: () => void
}

function ContactSelector({ groups, excludeIds, selectedIds, onSelectionChange, onAdd }: ContactSelectorProps) {
  const availableGroups = groups.filter((group) => !excludeIds.includes(group.id))

  return (
    <div className="space-y-4">
      <div className="border rounded-lg max-h-64 overflow-auto p-2 space-y-1">
        {availableGroups.map((group) => (
          <label key={group.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded cursor-pointer">
            <Checkbox
              checked={selectedIds.includes(group.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSelectionChange([...selectedIds, group.id])
                } else {
                  onSelectionChange(selectedIds.filter((id) => id !== group.id))
                }
              }}
            />
            <span className="flex-1">{group.name}</span>
            <span className="text-sm text-muted-foreground">{group.description}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => onSelectionChange([])}>
          Clear Selection
        </Button>
        <Button onClick={onAdd} disabled={selectedIds.length === 0}>
          Add {selectedIds.length} Group{selectedIds.length !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  )
}
