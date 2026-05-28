import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { HelpCircle } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground border border-border shadow-sm animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-popover fill-popover z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

interface InfoTooltipProps {
  content: string
  side?: React.ComponentProps<typeof TooltipPrimitive.Content>['side']
  iconClassName?: string
}

function InfoTooltip({
  content,
  side = 'right',
  iconClassName,
}: InfoTooltipProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLSpanElement>(null)

  // Close when tapping outside on mobile (document pointerdown listener is
  // only active while the tooltip is open to avoid unnecessary overhead).
  React.useEffect(() => {
    if (!open) return
    function handleOutside(e: PointerEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleOutside)
    return () => document.removeEventListener('pointerdown', handleOutside)
  }, [open])

  return (
    // No onOpenChange — we drive open state entirely ourselves so Radix's
    // pointerenter/pointerleave callbacks can't fight with our touch logic.
    <Tooltip open={open}>
      <TooltipTrigger asChild>
        <span
          ref={triggerRef}
          tabIndex={0}
          onPointerEnter={(e) => {
            if (e.pointerType !== 'touch') setOpen(true)
          }}
          onPointerLeave={(e) => {
            if (e.pointerType !== 'touch') setOpen(false)
          }}
          onClick={(e) => {
            e.stopPropagation()
            setOpen((v) => !v)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setOpen((v) => !v)
            }
            if (e.key === 'Escape') setOpen(false)
          }}
          className={cn(
            'shrink-0 cursor-pointer text-muted-foreground hover:text-foreground transition-colors outline-none',
            iconClassName,
          )}
        >
          <HelpCircle className="h-4 w-4" />
        </span>
      </TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </Tooltip>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, InfoTooltip }
