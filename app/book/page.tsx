"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { services, brand } from "@/config/brand"
import { Clock, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function BookServicePage() {
  const router = useRouter()
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const handleContinue = () => {
    if (selectedService) {
      router.push(`/book/slots?service=${selectedService}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Book a Service</h1>
            <p className="text-sm text-gray-500">Step 1 of 3: Choose your service</p>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Select a Service</h2>
          <p className="text-gray-600">
            Choose the detailing package that best fits your needs
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-8">
          {services.filter(s => !s.isAddon).map((service) => (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all ${
                selectedService === service.id
                  ? "ring-2 ring-blue-600 shadow-lg"
                  : "hover:shadow-md"
              }`}
              onClick={() => setSelectedService(service.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs mt-2">
                      <Clock className="h-3 w-3" />
                      {service.duration} minutes
                    </CardDescription>
                  </div>
                  {selectedService === service.id && (
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <div className="text-2xl font-bold">${service.price}</div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div>
            {selectedService && (
              <p className="text-sm text-gray-600">
                Selected: <span className="font-semibold">
                  {services.find(s => s.id === selectedService)?.name}
                </span>
              </p>
            )}
          </div>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedService}
          >
            Continue to Date & Time
          </Button>
        </div>

        {/* Info banner */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Mobile Service:</strong> We come to you! You&apos;ll provide your address in the next step.
          </p>
        </div>
      </main>
    </div>
  )
}
