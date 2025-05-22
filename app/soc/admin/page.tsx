"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Clock, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function SOCAdminPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [comment, setComment] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const pendingRequests = [
    {
      id: 1,
      customer: "ABC Corp",
      requestDate: "2023-05-15",
      requester: "John Doe",
      details: "Need SOC compliance for new project",
    },
    {
      id: 2,
      customer: "XYZ Inc",
      requestDate: "2023-05-10",
      requester: "Jane Smith",
      details: "Annual SOC compliance update",
    },
  ]

  const approvedRequests = [
    {
      id: 3,
      customer: "123 Industries",
      requestDate: "2023-05-05",
      requester: "Bob Johnson",
      details: "SOC compliance for government contract",
      approvedDate: "2023-05-08",
      approver: "Admin User",
    },
  ]

  const rejectedRequests = [
    {
      id: 4,
      customer: "456 Corp",
      requestDate: "2023-05-01",
      requester: "Alice Brown",
      details: "SOC compliance for financial audit",
      rejectedDate: "2023-05-03",
      rejector: "Admin User",
      reason: "Insufficient information provided",
    },
  ]

  const handleApprove = () => {
    toast({
      title: "Success",
      description: "SOC request approved successfully",
    })
    setDialogOpen(false)
    setComment("")
  }

  const handleReject = () => {
    if (!comment) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "SOC request rejected successfully",
    })
    setDialogOpen(false)
    setComment("")
  }

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request)
    setDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">SOC Request Management</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              <Clock className="mr-2 h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle className="mr-2 h-4 w-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="mr-2 h-4 w-4" />
              Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending SOC Requests</CardTitle>
                <CardDescription>Review and process pending SOC requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRequests.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No pending requests</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left">Customer</th>
                          <th className="py-2 px-4 text-left">Requester</th>
                          <th className="py-2 px-4 text-left">Request Date</th>
                          <th className="py-2 px-4 text-left">Status</th>
                          <th className="py-2 px-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRequests.map((request) => (
                          <tr key={request.id} className="border-b">
                            <td className="py-2 px-4">{request.customer}</td>
                            <td className="py-2 px-4">{request.requester}</td>
                            <td className="py-2 px-4">{request.requestDate}</td>
                            <td className="py-2 px-4">{getStatusBadge("pending")}</td>
                            <td className="py-2 px-4">
                              <Button variant="outline" size="sm" onClick={() => handleViewDetails(request)}>
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved SOC Requests</CardTitle>
                <CardDescription>View approved SOC requests</CardDescription>
              </CardHeader>
              <CardContent>
                {approvedRequests.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No approved requests</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left">Customer</th>
                          <th className="py-2 px-4 text-left">Requester</th>
                          <th className="py-2 px-4 text-left">Request Date</th>
                          <th className="py-2 px-4 text-left">Approved Date</th>
                          <th className="py-2 px-4 text-left">Approver</th>
                          <th className="py-2 px-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedRequests.map((request) => (
                          <tr key={request.id} className="border-b">
                            <td className="py-2 px-4">{request.customer}</td>
                            <td className="py-2 px-4">{request.requester}</td>
                            <td className="py-2 px-4">{request.requestDate}</td>
                            <td className="py-2 px-4">{request.approvedDate}</td>
                            <td className="py-2 px-4">{request.approver}</td>
                            <td className="py-2 px-4">
                              <Button variant="outline" size="sm" onClick={() => handleViewDetails(request)}>
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Rejected SOC Requests</CardTitle>
                <CardDescription>View rejected SOC requests</CardDescription>
              </CardHeader>
              <CardContent>
                {rejectedRequests.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No rejected requests</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left">Customer</th>
                          <th className="py-2 px-4 text-left">Requester</th>
                          <th className="py-2 px-4 text-left">Request Date</th>
                          <th className="py-2 px-4 text-left">Rejected Date</th>
                          <th className="py-2 px-4 text-left">Rejector</th>
                          <th className="py-2 px-4 text-left">Reason</th>
                          <th className="py-2 px-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rejectedRequests.map((request) => (
                          <tr key={request.id} className="border-b">
                            <td className="py-2 px-4">{request.customer}</td>
                            <td className="py-2 px-4">{request.requester}</td>
                            <td className="py-2 px-4">{request.requestDate}</td>
                            <td className="py-2 px-4">{request.rejectedDate}</td>
                            <td className="py-2 px-4">{request.rejector}</td>
                            <td className="py-2 px-4">{request.reason}</td>
                            <td className="py-2 px-4">
                              <Button variant="outline" size="sm" onClick={() => handleViewDetails(request)}>
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedRequest && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>SOC Request Details</DialogTitle>
                <DialogDescription>Review the SOC request details and take action</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Customer</p>
                    <p>{selectedRequest.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Requester</p>
                    <p>{selectedRequest.requester}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Request Date</p>
                    <p>{selectedRequest.requestDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Status</p>
                    <p>
                      {selectedRequest.approvedDate
                        ? getStatusBadge("approved")
                        : selectedRequest.rejectedDate
                          ? getStatusBadge("rejected")
                          : getStatusBadge("pending")}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Request Details</p>
                  <div className="border rounded-md p-3 bg-muted/50">
                    <p>{selectedRequest.details}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Attachments</p>
                  <div className="border rounded-md p-3 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <p>SOC_Request_Document.pdf</p>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                {activeTab === "pending" && (
                  <div>
                    <p className="text-sm font-medium mb-1">Comment</p>
                    <Textarea
                      placeholder="Add a comment or reason for rejection"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                {activeTab === "pending" ? (
                  <>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleReject}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button onClick={handleApprove}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Close
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
