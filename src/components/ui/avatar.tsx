
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar(
  { className, ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
  ref: React.Ref<React.ElementRef<typeof AvatarPrimitive.Root>>
) {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage(
  { className, ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>,
  ref: React.Ref<React.ElementRef<typeof AvatarPrimitive.Image>>
) {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  )
}

function AvatarFallback(
  { className, ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>,
  ref: React.Ref<React.ElementRef<typeof AvatarPrimitive.Fallback>>
) {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
