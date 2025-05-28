"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileText, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Contact {
  id: string
  name: string
  phone: string
  [key: string]: string
}

interface FileUploadProps {
  onContactsUpdate: (contacts: Contact[]) => void
}

export default function FileUpload({ onContactsUpdate }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const parseCSV = (text: string): Contact[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length < 2) throw new Error("CSV must have at least a header and one data row")

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    const contacts: Contact[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
      if (values.length !== headers.length) continue

      const contact: Contact = {
        id: `contact_${i}`,
        name: "",
        phone: "",
      }

      headers.forEach((header, index) => {
        const key = header.toLowerCase()
        if (key.includes("name")) contact.name = values[index]
        else if (key.includes("phone") || key.includes("number")) contact.phone = values[index]
        else contact[header] = values[index]
      })

      if (contact.phone) contacts.push(contact)
    }

    return contacts
  }

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true)
    setError(null)
    setUploadProgress(0)

    try {
      const text = await file.text()

      // Simulate processing progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      let contacts: Contact[] = []

      if (file.name.endsWith(".csv")) {
        contacts = parseCSV(text)
      } else {
        throw new Error("Only CSV files are supported in this demo")
      }

      if (contacts.length === 0) {
        throw new Error("No valid contacts found in file")
      }

      onContactsUpdate(contacts)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file")
    } finally {
      setIsProcessing(false)
    }
  }, [onContactsUpdate])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xlsx"))) {
      setUploadedFile(file)
      processFile(file)
    } else {
      setError("Please upload a CSV or Excel file")
    }
  }, [processFile])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      processFile(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setError(null)
    setUploadProgress(0)
    setSuccess(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Contact List</CardTitle>
          <CardDescription>
            Upload a CSV or Excel file containing your contacts. Required columns: Name, Phone. Additional columns can
            be used as template variables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!uploadedFile ? (
              <>
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Drop your file here</h3>
                <p className="text-muted-foreground mb-4">or click to browse for CSV/Excel files</p>
                <Button asChild>
                  <label className="cursor-pointer">
                    <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="hidden" />
                    Choose File
                  </label>
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <span className="font-medium">{uploadedFile.name}</span>
                  <Button variant="ghost" size="sm" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">Processing file...</p>
                  </div>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      File uploaded and processed successfully!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Format Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Required Columns:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>
                  <strong>Name</strong> - Contact's full name
                </li>
                <li>
                  <strong>Phone</strong> - Phone number with country code (e.g., +1234567890)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Optional Columns (for personalization):</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Company, Order, Amount, Date, etc.</li>
                <li>Use these as template variables: {`{{company}}, {{order}}, {{amount}}`}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Example CSV Format:</h4>
              <div className="bg-muted p-3 rounded text-sm font-mono">
                Name,Phone,Company,Order
                <br />
                John Doe,+1234567890,Acme Corp,#12345
                <br />
                Jane Smith,+0987654321,Tech Inc,#67890
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
