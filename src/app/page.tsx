import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Clock, Cloud } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background grid">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto">
          <div className="flex items-center space-x-2">
            <Cloud className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">Cloud Case</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </nav>
          <Button asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 mx-auto">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              Trusted by 500+ Law Firms
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Streamline Your{" "}
              <span className="text-accent">Legal Practice</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground text-pretty max-w-2xl mx-auto">
              Manage cases, track deadlines, and collaborate with your team more
              efficiently. Our comprehensive legal case management system helps
              you focus on what matters most - your clients.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <Link href="/dashboard">Start Your Free Trial</Link>
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-muted/20 via-background to-muted/10" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30 px-auto">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage your practice
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed specifically for legal professionals
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold">Case Management</h3>
                </div>
                <p className="text-muted-foreground">
                  Organize and track all your cases in one centralized location
                  with detailed case histories and documentation.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold">Deadline Tracking</h3>
                </div>
                <p className="text-muted-foreground">
                  Never miss important deadlines with automated reminders and
                  calendar integration for all your cases.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold">Team Collaboration</h3>
                </div>
                <p className="text-muted-foreground">
                  Collaborate seamlessly with your team members, assign tasks,
                  and share case information securely.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Trusted by legal professionals
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See what our clients have to say about Cloud Case
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-accent">
                        SJ
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground italic mb-4">
                      &quot;Cloud Case has transformed how we manage our cases.
                      The deadline tracking alone has saved us countless hours
                      and prevented missed deadlines.&quot;
                    </p>
                    <div>
                      <p className="font-semibold">Sarah Johnson</p>
                      <p className="text-sm text-muted-foreground">
                        Partner, Johnson & Associates
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-accent">
                        MC
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground italic mb-4">
                      &quot;The team collaboration features are outstanding. Our
                      entire firm can now work together more efficiently than
                      ever before.&quot;
                    </p>
                    <div>
                      <p className="font-semibold">Michael Chen</p>
                      <p className="text-sm text-muted-foreground">
                        Managing Partner, Chen Law Group
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto">
          <div className="mx-auto container text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to streamline your practice?
            </h2>
            <p className="mt-4 text-lg opacity-90">
              Join hundreds of law firms already using Cloud Case to manage
              their cases more efficiently.
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/dashboard">Start Free Trial</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-12 mx-auto">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Cloud className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-primary">
                  Cloud Case
                </span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Professional legal case management software designed to help law
                firms operate more efficiently and serve their clients better.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="hover:text-primary transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-primary transition-colors"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#contact"
                    className="hover:text-primary transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Cloud Case. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
