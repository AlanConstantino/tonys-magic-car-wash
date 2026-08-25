import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { brand, services } from "@/config/brand"
import { CheckCircle2, Clock, MapPin, Phone, Mail } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold">{brand.name}</div>
            {brand.isPlaceholder && (
              <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                Demo
              </span>
            )}
          </div>
          <nav className="flex items-center gap-4">
            <Link href="#services" className="text-sm font-medium hover:underline">
              Services
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline">
              How It Works
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:underline">
              Contact
            </Link>
            <Button asChild>
              <Link href="/book">Book Now</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-blue-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  {brand.tagline}
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  {brand.description}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/book">Schedule Service</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#services">View Services</Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{brand.serviceArea}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{brand.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Our Services
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Professional detailing packages to keep your vehicle looking its best
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => (
                <Card key={service.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs mt-2">
                      <Clock className="h-3 w-3" />
                      {service.duration} min
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
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
                  <CardFooter className="flex flex-col items-start gap-2">
                    <div className="text-2xl font-bold">${service.price}</div>
                    {service.isAddon && (
                      <span className="text-xs text-gray-500">Add-on service</span>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <Button size="lg" asChild>
                <Link href="/book">Book Your Service</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Book online and we&apos;ll come to you
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold">Choose Your Service</h3>
                <p className="text-gray-500">
                  Select from our range of detailing packages that fit your needs and budget
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold">Pick a Time</h3>
                <p className="text-gray-500">
                  Select an available time slot that works with your schedule
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold">We Come to You</h3>
                <p className="text-gray-500">
                  Our mobile detailing service arrives at your location at the scheduled time
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hours & Contact Section */}
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-6">Hours</h2>
                <div className="space-y-2">
                  {Object.entries(brand.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="capitalize font-medium">{day}</span>
                      <span className="text-gray-600">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-6">Contact</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href={`tel:${brand.phone.replace(/\D/g, '')}`} className="text-gray-600 hover:underline">
                        {brand.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href={`mailto:${brand.email}`} className="text-gray-600 hover:underline">
                        {brand.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium">Service Area</p>
                      <p className="text-gray-600">{brand.serviceArea}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 bg-blue-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to get started?
              </h2>
              <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl">
                Book your mobile detailing service today and experience the convenience of professional car care at your location
              </p>
              <Button size="lg" variant="secondary" asChild className="mt-4">
                <Link href="/book">Schedule Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 py-6 bg-gray-50">
        <div className="container flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 md:px-6">
          <p className="text-xs text-gray-500">
            © 2026 {brand.name}. All rights reserved.
          </p>
          {brand.isPlaceholder && (
            <p className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
              {brand.placeholderNote}
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}
