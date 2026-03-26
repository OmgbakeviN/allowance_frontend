import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "motion/react"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  HandCoins,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const stats = [
  { label: "Automatic allocation", value: "Bills • Savings • Daily", icon: Wallet },
  { label: "Designed for students", value: "Smarter monthly discipline", icon: GraduationCap },
  { label: "Parent visibility", value: "Clear and reassuring", icon: ShieldCheck },
  { label: "Expense tracking", value: "Every franc has a purpose", icon: BarChart3 },
]

const steps = [
  {
    number: "01",
    title: "Create a smart budget plan",
    text: "Set how money should be split between bills, savings, and daily spending so the student starts with structure.",
    icon: PiggyBank,
  },
  {
    number: "02",
    title: "Fund the wallet with confidence",
    text: "Parents can top up the student account while keeping visibility on how the money is intended to be used.",
    icon: HandCoins,
  },
  {
    number: "03",
    title: "Track spending every day",
    text: "Students spend with more discipline while parents follow progress through a clean and transparent dashboard.",
    icon: ReceiptText,
  },
]

const featureGrid = [
  {
    title: "Smart Wallet Buckets",
    description: "Organize every top-up into meaningful categories instead of leaving students with one unstructured balance.",
    icon: Wallet,
    span: "md:col-span-2 md:row-span-1",
  },
  {
    title: "Bills Come First",
    description: "Important needs are handled before flexible spending begins.",
    icon: ShieldCheck,
    span: "md:col-span-1",
  },
  {
    title: "Savings by Design",
    description: "Build better habits through fixed allocations and long-term thinking.",
    icon: PiggyBank,
    span: "md:col-span-1",
  },
  {
    title: "Parent + Student Visibility",
    description: "A two-sided experience that improves trust and communication.",
    icon: Users,
    span: "md:col-span-1",
  },
  {
    title: "Beautiful Budget Reports",
    description: "Understand trends, monitor categories, and spot overspending early.",
    icon: BarChart3,
    span: "md:col-span-2",
  },
]

const faqs = [
  {
    q: "How does Budggio split money?",
    a: "Budggio is built around structured student budgeting. Funds can be organized into categories such as bills, savings, and daily spending so the student has a clear plan from the start.",
  },
  {
    q: "Is Budggio only for students?",
    a: "The core experience is made for students, but it also includes a parent view so both sides can collaborate around responsible money management.",
  },
  {
    q: "Can I add my own student or parent images later?",
    a: "Yes. This layout already includes placeholder blocks where you can replace the demo boxes with real screenshots or photos.",
  },
  {
    q: "Does this landing page support dark mode?",
    a: "Yes. The design uses shadcn theme tokens like background, foreground, card, border, and primary so it adapts naturally to your light and dark theme.",
  },
]

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </a>
  )
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll()

  const heroCardY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const heroCardY2 = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-10rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-card shadow-sm">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight">Budggio</div>
              <div className="text-xs text-muted-foreground">Student finance, redesigned</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How it works</NavLink>
            <NavLink href="#for-everyone">For everyone</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/register">
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <Reveal className="max-w-2xl">
              <Badge variant="secondary" className="mb-5 rounded-full px-4 py-1.5">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Smart budgeting for students
              </Badge>

              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Send money with
                <span className="block text-primary">structure, not stress.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Budggio helps parents fund student life with clarity while automatically organizing
                money into bills, savings, and daily spending.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-2xl px-7">
                  <Link to="/register">
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="rounded-2xl px-7">
                  <Link to="/login">Explore the app</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:flex-wrap">
                {[
                  "Automatic allocation",
                  "Student-first budgeting",
                  "Transparent parent view",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="relative mx-auto w-full max-w-2xl" style={{ perspective: 1400 }}>
                <motion.div
                  whileHover={{ rotateX: 4, rotateY: -5, y: -6 }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  className="relative rounded-[2rem] border border-border/70 bg-card/70 p-3 shadow-2xl backdrop-blur"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="relative overflow-hidden rounded-[1.75rem] border bg-background">
                    <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/15 to-transparent" />

                    <div className="relative grid min-h-[520px] gap-4 p-4 sm:p-6">
                      <div
                        className="rounded-[1.5rem] border bg-card/90 p-5 shadow-sm"
                        style={{ transform: "translateZ(28px)" }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Budggio dashboard mockup</p>
                            <h3 className="mt-1 text-xl font-semibold">Replace with your app screenshot</h3>
                          </div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                            <Wallet className="h-6 w-6 text-primary" />
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl border bg-background p-4">
                            <p className="text-xs text-muted-foreground">Bills</p>
                            <p className="mt-2 text-lg font-semibold">40%</p>
                          </div>
                          <div className="rounded-2xl border bg-background p-4">
                            <p className="text-xs text-muted-foreground">Savings</p>
                            <p className="mt-2 text-lg font-semibold">25%</p>
                          </div>
                          <div className="rounded-2xl border bg-background p-4">
                            <p className="text-xs text-muted-foreground">Daily</p>
                            <p className="mt-2 text-lg font-semibold">35%</p>
                          </div>
                        </div>

                        <div className="mt-5 rounded-[1.5rem] border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                          <img
                            src="public\images\dashboard.png"
                            alt="Budggio dashboard"
                            className="h-full w-full rounded-[1.5rem] object-cover"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                        
                          <img
                            src="public\images\student.png"
                            alt="Budggio dashboard"
                            className="h-full w-full rounded-[1.5rem] object-cover"
                          />
                        

                        
                          <img
                            src="public\images\parent.png"
                            alt="Budggio dashboard"
                            className="h-full w-full rounded-[1.5rem] object-cover"
                          />
                        
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  style={{ y: heroCardY }}
                  className="absolute -left-4 top-10 hidden w-52 rounded-[1.5rem] border bg-background/90 p-4 shadow-xl backdrop-blur md:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <PiggyBank className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Savings goal</p>
                      <p className="font-semibold">Consistent every month</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  style={{ y: heroCardY2 }}
                  className="absolute -right-4 bottom-10 hidden w-56 rounded-[1.5rem] border bg-background/90 p-4 shadow-xl backdrop-blur md:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Parent view</p>
                      <p className="font-semibold">Clear, calm, transparent</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
          <Reveal>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.45 }}
                  >
                    <Card className="rounded-[1.5rem] border-border/70 bg-card/70 backdrop-blur">
                      <CardContent className="flex items-start gap-4 p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{item.label}</p>
                          <p className="mt-1 text-base font-semibold">{item.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </Reveal>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5">
              How it works
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              A better money flow for student life
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built to make funding, budgeting, and monitoring feel simple for both students and parents.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <Reveal key={step.title} delay={index * 0.1}>
                  <Card className="group h-full rounded-[1.75rem] border-border/70 bg-card/70 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl">
                    <CardHeader>
                      <div className="mb-5 flex items-center justify-between">
                        <Badge variant="outline" className="rounded-full px-3 py-1">
                          {step.number}
                        </Badge>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 transition-transform group-hover:scale-105">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                      <CardDescription className="pt-2 text-sm leading-7">
                        {step.text}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Reveal>
              )
            })}
          </div>
        </section>

        <section id="for-everyone" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <Card className="h-full rounded-[2rem] border-border/70 bg-card/70 backdrop-blur">
                <CardHeader className="pb-4">
                  <Badge variant="secondary" className="w-fit rounded-full px-4 py-1.5">
                    For students
                  </Badge>
                  <CardTitle className="mt-4 text-3xl">Stay in control without feeling restricted</CardTitle>
                  <CardDescription className="pt-2 text-base leading-7">
                    Budggio helps students manage their needs, save intentionally, and build stronger money habits every month.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {[
                    "View your available balance with clarity",
                    "Follow a structured monthly plan",
                    "Track expenses before they become a problem",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}

                  <div className="rounded-[1.5rem] border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                    <img
                      src="public\images\student-happy.png"
                      alt="Budggio dashboard"
                      className="h-full w-full rounded-[1.5rem] object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={0.1}>
              <Card className="h-full rounded-[2rem] border-border/70 bg-card/70 backdrop-blur">
                <CardHeader className="pb-4">
                  <Badge variant="secondary" className="w-fit rounded-full px-4 py-1.5">
                    For parents
                  </Badge>
                  <CardTitle className="mt-4 text-3xl">Support with confidence and transparency</CardTitle>
                  <CardDescription className="pt-2 text-base leading-7">
                    Parents can fund student life in a more thoughtful way while keeping clear visibility into the budgeting structure.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {[
                    "Fund with a clearer purpose",
                    "See the student budget structure at a glance",
                    "Build trust through shared financial discipline",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}

                  <div className="rounded-[1.5rem] border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                    <img
                      src="public\images\parent-happy.png"
                      alt="Budggio dashboard"
                      className="h-full w-full rounded-[1.5rem] object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5">
              Features
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              A premium layout built around your product story
            </h2>
            <p className="mt-4 text-muted-foreground">
              Clean sections, strong cards, scroll animations, and image placeholders ready for your final project presentation.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {featureGrid.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Reveal key={feature.title} delay={index * 0.06} className={feature.span}>
                  <motion.div whileHover={{ y: -6 }}>
                    <Card className="h-full rounded-[1.75rem] border-border/70 bg-card/70 backdrop-blur">
                      <CardHeader>
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription className="pt-2 text-sm leading-7">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                </Reveal>
              )
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <Reveal>
            <div
              className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/60 p-5 shadow-2xl backdrop-blur md:p-8"
              style={{ perspective: 1400 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

              <div className="relative grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                <div>
                  <Badge variant="secondary" className="rounded-full px-4 py-1.5">
                    Visual showcase
                  </Badge>

                  <h3 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Present Budggio like a modern product, not just a school project
                  </h3>

                  <p className="mt-4 max-w-xl text-muted-foreground">
                    This section is intentionally designed to let you drop in polished screenshots, student images, or dashboard previews before your final defense.
                  </p>

                  <div className="mt-8 space-y-4">
                    {[
                      "Uses your shadcn theme colors automatically",
                      "Includes scroll reveal and motion transitions",
                      "Has image zones for student and parent visuals",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <ChevronRight className="mt-0.5 h-5 w-5 text-primary" />
                        <p className="text-sm text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex gap-3">
                    <Button asChild className="rounded-xl">
                      <Link to="/register">Start now</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link to="/login">Login</Link>
                    </Button>
                  </div>
                </div>

                <motion.div
                  whileHover={{ rotateX: 4, rotateY: -6, y: -8 }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  className="relative"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="rounded-[2rem] border bg-background p-4 shadow-xl">
                    <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                      <div
                        className="rounded-[1.5rem] border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground"
                        style={{ transform: "translateZ(38px)" }}
                      >
                        LARGE DASHBOARD / PRODUCT SCREENSHOT
                      </div>

                      <div className="grid gap-4">
                        <div
                          className="rounded-[1.5rem] border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground"
                          style={{ transform: "translateZ(50px)" }}
                        >
                          STUDENT PHOTO
                        </div>
                        <div
                          className="rounded-[1.5rem] border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground"
                          style={{ transform: "translateZ(62px)" }}
                        >
                          PARENT PHOTO
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="faq" className="mx-auto max-w-4xl px-4 py-20 md:px-6">
          <Reveal className="text-center">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5">
              FAQ
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Common questions about the landing page
            </h2>
            <p className="mt-4 text-muted-foreground">
              You can keep these answers or replace them with your own final presentation content.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <Card className="rounded-[2rem] border-border/70 bg-card/70 backdrop-blur">
              <CardContent className="p-6 md:p-8">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((item, index) => (
                    <AccordionItem key={item.q} value={`item-${index}`}>
                      <AccordionTrigger className="text-left text-base font-medium">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-7 text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 pt-8 md:px-6">
          <Reveal>
            <Card className="overflow-hidden rounded-[2rem] border-border/70 bg-card/70 backdrop-blur">
              <CardContent className="relative p-8 md:p-12">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent" />
                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <Badge variant="secondary" className="rounded-full px-4 py-1.5">
                      Final call
                    </Badge>
                    <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                      Start building smarter student budgets with Budggio
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                      A polished landing page, ready for your HND final presentation and easy to customize with your own screenshots.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg" className="rounded-xl px-7">
                      <Link to="/register">
                        Create account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-xl px-7">
                      <Link to="/login">Log in</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-card">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Budggio</p>
              <p className="text-sm text-muted-foreground">Smart budgeting for student life</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how-it-works" className="hover:text-foreground">How it works</a>
            <a href="#for-everyone" className="hover:text-foreground">For everyone</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  )
}