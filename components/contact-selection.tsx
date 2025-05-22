"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash, UserPlus } from "lucide-react"
import { getCompanyContacts, getCushmanContacts, type CompanyContact } from "@/lib/soc-data"

interface ContactSelectionProps {
  companyName: string
  onContactsSelected: (companyContacts: CompanyContact[], cushmanContacts: CompanyContact[]) => void
}

export function ContactSelection({ companyName, onContactsSelected }: ContactSelectionProps) {
  const [companyContacts, setCompanyContacts] = useState<CompanyContact[]>([])
  const [cushmanContacts, setCushmanContacts] = useState<CompanyContact[]>([])
  const [selectedCompanyContacts, setSelectedCompanyContacts] = useState<string[]>([])
  const [selectedCushmanContacts, setSelectedCushmanContacts] = useState<string[]>([])
  const [newContact, setNewContact] = useState<Partial<CompanyContact>>({
    name: "",
    email: "",
    position: "",
    company: companyName,
    type: "company",
  })
  const [newCushmanContact, setNewCushmanContact] = useState<Partial<CompanyContact>>({
    name: "",
    email: "",
    position: "",
    company: "쿠시먼앤웨이크필드",
    type: "cushman",
  })

  // Load contacts when company name changes
  useEffect(() => {
    if (companyName) {
      const contacts = getCompanyContacts(companyName)
      setCompanyContacts(contacts)
      // Auto-select all company contacts
      setSelectedCompanyContacts(contacts.map((contact) => contact.id))

      const cushmanContacts = getCushmanContacts()
      setCushmanContacts(cushmanContacts)
      // Auto-select all Cushman contacts
      setSelectedCushmanContacts(cushmanContacts.map((contact) => contact.id))
    }
  }, [companyName])

  // Update parent component when selections change
  useEffect(() => {
    const selectedCompany = companyContacts.filter((contact) => selectedCompanyContacts.includes(contact.id))

    const selectedCushman = cushmanContacts.filter((contact) => selectedCushmanContacts.includes(contact.id))

    onContactsSelected(selectedCompany, selectedCushman)
  }, [selectedCompanyContacts, selectedCushmanContacts, companyContacts, cushmanContacts, onContactsSelected])

  const handleCompanyContactToggle = (id: string) => {
    setSelectedCompanyContacts((prev) =>
      prev.includes(id) ? prev.filter((contactId) => contactId !== id) : [...prev, id],
    )
  }

  const handleCushmanContactToggle = (id: string) => {
    setSelectedCushmanContacts((prev) =>
      prev.includes(id) ? prev.filter((contactId) => contactId !== id) : [...prev, id],
    )
  }

  const handleAddCompanyContact = () => {
    if (!newContact.name || !newContact.email || !newContact.position) {
      return
    }

    const contact: CompanyContact = {
      id: `new-${Date.now()}`,
      name: newContact.name || "",
      email: newContact.email || "",
      position: newContact.position || "",
      company: companyName,
      type: "company",
    }

    setCompanyContacts((prev) => [...prev, contact])
    setSelectedCompanyContacts((prev) => [...prev, contact.id])
    setNewContact({
      name: "",
      email: "",
      position: "",
      company: companyName,
      type: "company",
    })
  }

  const handleAddCushmanContact = () => {
    if (!newCushmanContact.name || !newCushmanContact.email || !newCushmanContact.position) {
      return
    }

    const contact: CompanyContact = {
      id: `new-cushman-${Date.now()}`,
      name: newCushmanContact.name || "",
      email: newCushmanContact.email || "",
      position: newCushmanContact.position || "",
      company: "쿠시먼앤웨이크필드",
      type: "cushman",
    }

    setCushmanContacts((prev) => [...prev, contact])
    setSelectedCushmanContacts((prev) => [...prev, contact.id])
    setNewCushmanContact({
      name: "",
      email: "",
      position: "",
      company: "쿠시먼앤웨이크필드",
      type: "cushman",
    })
  }

  const handleRemoveCompanyContact = (id: string) => {
    setCompanyContacts((prev) => prev.filter((contact) => contact.id !== id))
    setSelectedCompanyContacts((prev) => prev.filter((contactId) => contactId !== id))
  }

  const handleRemoveCushmanContact = (id: string) => {
    setCushmanContacts((prev) => prev.filter((contact) => contact.id !== id))
    setSelectedCushmanContacts((prev) => prev.filter((contactId) => contactId !== id))
  }

  return (
    <div className="space-y-6">
      {/* Company Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>참석자 *</CardTitle>
        </CardHeader>
        <CardContent>
          {companyContacts.length > 0 && (
            <Table className="mb-4">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>직책</TableHead>
                  <TableHead>회사명</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCompanyContacts.includes(contact.id)}
                        onCheckedChange={() => handleCompanyContactToggle(contact.id)}
                      />
                    </TableCell>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.position}</TableCell>
                    <TableCell>{contact.company}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCompanyContact(contact.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="position">직책</Label>
              <Input
                id="position"
                value={newContact.position}
                onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddCompanyContact}
                disabled={!newContact.name || !newContact.email || !newContact.position}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                참석자 추가
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cushman Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>쿠시먼 참석자 *</CardTitle>
        </CardHeader>
        <CardContent>
          {cushmanContacts.length > 0 && (
            <Table className="mb-4">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>직책</TableHead>
                  <TableHead>회사명</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cushmanContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCushmanContacts.includes(contact.id)}
                        onCheckedChange={() => handleCushmanContactToggle(contact.id)}
                      />
                    </TableCell>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.position}</TableCell>
                    <TableCell>{contact.company}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCushmanContact(contact.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="cushman-name">이름</Label>
              <Input
                id="cushman-name"
                value={newCushmanContact.name}
                onChange={(e) => setNewCushmanContact({ ...newCushmanContact, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cushman-email">이메일</Label>
              <Input
                id="cushman-email"
                type="email"
                value={newCushmanContact.email}
                onChange={(e) => setNewCushmanContact({ ...newCushmanContact, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cushman-position">직책</Label>
              <Input
                id="cushman-position"
                value={newCushmanContact.position}
                onChange={(e) => setNewCushmanContact({ ...newCushmanContact, position: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddCushmanContact}
                disabled={!newCushmanContact.name || !newCushmanContact.email || !newCushmanContact.position}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                쿠시먼 참석자 추가
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
