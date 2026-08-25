"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { services } from "@/config/brand"
import { ArrowLeft, Loader2 } from "lucide-react"
import { format } from "date-fns"

function DetailsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const serviceId = searchParams.get("service")
  const dateStr = searchParams.get("date")
  const durationStr = searchParams.get("duration")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const service = services.find((s) => s.id === serviceId)
  const scheduledDate = dateStr ? new Date(dateStr) : null

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleColor: "",
    serviceAddress: "",
    serviceCity: "",
    serviceState: "CA",
    serviceZip: "",
    addressNotes: "",
    customerNotes: "",
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.customerName || !formData.customerEmail || !formData.customerPhone ||
          !formData.vehicleMake || !formData.vehicleModel ||
          !formData.serviceAddress || !formData.serviceCity || !formData.serviceZip) {
        throw new Error("Please fill in all required fields")
      }

      // Create checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          scheduledAt: dateStr,
          duration: parseInt(durationStr || "0"),
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (err) {
      console.error("Checkout error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsSubmitting(false)
    }
  }

  if (!service || !scheduledDate) {
    router.push("/book")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/book/slots?service=${serviceId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Book a Service</h1>
            <p className="text-sm text-gray-500">Step 3 of 3: Your details</p>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Service</p>
              <p className="font-semibold">{service.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Date & Time</p>
              <p className="font-semibold">
                {format(scheduledDate, "EEE, MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Duration</p>
              <p className="font-semibold">{service.duration} minutes</p>
            </div>
            <div>
              <p className="text-gray-600">Price</p>
              <p className="font-semibold text-lg">${service.price}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone *</Label>
                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    required
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="vehicleMake">Make *</Label>
                  <Input
                    id="vehicleMake"
                    name="vehicleMake"
                    value={formData.vehicleMake}
                    onChange={handleInputChange}
                    required
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleModel">Model *</Label>
                  <Input
                    id="vehicleModel"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleInputChange}
                    required
                    placeholder="Camry"
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleColor">Color</Label>
                  <Input
                    id="vehicleColor"
                    name="vehicleColor"
                    value={formData.vehicleColor}
                    onChange={handleInputChange}
                    placeholder="Silver"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Address */}
          <Card>
            <CardHeader>
              <CardTitle>Service Location</CardTitle>
              <p className="text-sm text-gray-500">Where should we come to detail your vehicle?</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="serviceAddress">Street Address *</Label>
                <Input
                  id="serviceAddress"
                  name="serviceAddress"
                  value={formData.serviceAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="serviceCity">City *</Label>
                  <Input
                    id="serviceCity"
                    name="serviceCity"
                    value={formData.serviceCity}
                    onChange={handleInputChange}
                    required
                    placeholder="San Diego"
                  />
                </div>
                <div>
                  <Label htmlFor="serviceState">State *</Label>
                  <Input
                    id="serviceState"
                    name="serviceState"
                    value={formData.serviceState}
                    onChange={handleInputChange}
                    required
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="serviceZip">ZIP Code *</Label>
                  <Input
                    id="serviceZip"
                    name="serviceZip"
                    value={formData.serviceZip}
                    onChange={handleInputChange}
                    required
                    placeholder="92101"
                    pattern="[0-9]{5}"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="addressNotes">
                  Address Notes (optional)
                </Label>
                <Textarea
                  id="addressNotes"
                  name="addressNotes"
                  value={formData.addressNotes}
                  onChange={handleInputChange}
                  placeholder="e.g., Gate code, parking instructions, etc."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes (optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="customerNotes"
                name="customerNotes"
                value={formData.customerNotes}
                onChange={handleInputChange}
                placeholder="Any special requests or information we should know?"
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between items-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div>
              <p className="text-lg font-semibold">Total: ${service.price}</p>
              <p className="text-sm text-gray-500">Payment processed by Stripe</p>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default function DetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <DetailsPageContent />
    </Suspense>
  )
}
