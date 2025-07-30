"use client"

import * as React from "react"
import { Search, Users, DollarSign, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useToast } from "@/hooks/use-toast"

const searchData = [
  {
    group: "Contacts",
    items: [
      { id: "1", title: "John Doe", subtitle: "john@example.com", icon: Users },
      { id: "2", title: "Jane Smith", subtitle: "jane@company.com", icon: Users },
      { id: "3", title: "Mike Johnson", subtitle: "mike@startup.ng", icon: Users },
    ],
  },
  {
    group: "Deals",
    items: [
      { id: "4", title: "Website Redesign", subtitle: "₦500,000", icon: DollarSign },
      { id: "5", title: "Mobile App Development", subtitle: "₦1,200,000", icon: DollarSign },
      { id: "6", title: "Digital Marketing Campaign", subtitle: "₦300,000", icon: DollarSign },
    ],
  },
  {
    group: "Campaigns",
    items: [
      { id: "7", title: "Monthly Newsletter", subtitle: "Email Campaign", icon: Mail },
      { id: "8", title: "Product Launch", subtitle: "WhatsApp Broadcast", icon: Mail },
      { id: "9", title: "Customer Survey", subtitle: "SMS Campaign", icon: Mail },
    ],
  },
  {
    group: "Appointments",
    items: [
      { id: "10", title: "Client Meeting", subtitle: "Today, 2:00 PM", icon: Calendar },
      { id: "11", title: "Sales Call", subtitle: "Tomorrow, 10:00 AM", icon: Calendar },
      { id: "12", title: "Demo Presentation", subtitle: "Friday, 3:00 PM", icon: Calendar },
    ],
  },
]

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = (item: any) => {
    setOpen(false)
    toast({
      title: "Item Selected",
      description: `You selected: ${item.title}`,
    })
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64 bg-transparent"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search everything...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchData.map((group, index) => (
            <React.Fragment key={group.group}>
              <CommandGroup heading={group.group}>
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem key={item.id} onSelect={() => handleSelect(item)} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {index < searchData.length - 1 && <CommandSeparator />}
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
