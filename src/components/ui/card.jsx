import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Composant Card avec fond décoratif (gradient + lignes SVG)
 * Le contenu est placé au-dessus grâce à un z-index approprié.
 */
function Card({ className, children, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "relative isolate overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {/* Éléments décoratifs (inertes pour les lecteurs d'écran) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(120%_120%_at_100%_0%,rgba(79,157,255,0.18)_0%,rgba(124,90,222,0.14)_35%,transparent_72%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-0 w-2/3 bg-gradient-to-l from-violet-500/10 via-blue-500/10 to-transparent"
      />

      <img
        src="/lines.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 z-0 h-full max-w-none object-contain opacity-[0.2] [mask-image:linear-gradient(to_left,black,transparent)]"
      />

      {/* Contenu principal (passe au-dessus des décors) */}
      <div className="relative z-10 flex flex-col gap-6 py-6">
        {children}
      </div>
    </div>
  )
}

function CardHeader({ className, children, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function CardTitle({ className, children, ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function CardDescription({ className, children, ...props }) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function CardAction({ className, children, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function CardContent({ className, children, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function CardFooter({ className, children, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}