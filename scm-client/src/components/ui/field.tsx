import * as React from "react"
import { cn } from "@/lib/utils"

export function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-4", className)} {...props} />
}

export function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-2", className)} {...props} />
}

export function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300",
        className
      )}
      {...props}
    />
  )
}

export function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-xs text-muted-foreground", className)} {...props} />
}

export function FieldSeparator({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("relative flex py-2 items-center", className)} {...props}>
      <div className="flex-grow border-t border-border" />
      {children && (
        <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase tracking-wider font-medium bg-background px-1">
          {children}
        </span>
      )}
      <div className="flex-grow border-t border-border" />
    </div>
  )
}
