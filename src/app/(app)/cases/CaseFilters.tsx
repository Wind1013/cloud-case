"use client";

import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  IconFilter,
  IconBriefcase,
  IconScale,
  IconShieldLock,
  IconClock,
  IconLoader,
  IconCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

const caseTypes = [
  { value: "ADMINISTRATIVE", label: "Administrative", icon: IconBriefcase },
  { value: "CIVIL", label: "Civil", icon: IconScale },
  { value: "CRIMINAL", label: "Criminal", icon: IconShieldLock },
];

const caseStatuses = [
  { value: "ARRAIGNMENT", label: "Arraignment", icon: IconClock },
  { value: "PRETRIAL", label: "Pretrial", icon: IconLoader },
  { value: "TRIAL", label: "Trial", icon: IconLoader },
  { value: "PROMULGATION", label: "Promulgation", icon: IconCheck },
  { value: "REMEDIES", label: "Remedies", icon: IconCheck },
  {
    value: "PRELIMINARY_CONFERENCE",
    label: "Preliminary Conference",
    icon: IconClock,
  },
  { value: "DECISION", label: "Decision", icon: IconCheck },
];

export function CaseFilters() {
  const [type, setType] = useQueryState(
    "type",
    parseAsArrayOf(parseAsString)
      .withDefault([])
      .withOptions({ shallow: false })
  );
  const [status, setStatus] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString)
      .withDefault([])
      .withOptions({ shallow: false })
  );

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <IconFilter className="mr-2 size-4" />
            Type
            {type.length > 0 && <Badge className="ml-2">{type.length}</Badge>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {caseTypes.map(item => (
            <DropdownMenuCheckboxItem
              key={item.value}
              checked={type.includes(item.value)}
              onCheckedChange={checked => {
                setType(
                  checked
                    ? [...type, item.value]
                    : type.filter(t => t !== item.value)
                );
              }}
            >
              <item.icon className="mr-2 size-4" />
              {item.label}
            </DropdownMenuCheckboxItem>
          ))}
          {type.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setType(null)}
                className="justify-center text-center"
              >
                Clear filters
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <IconFilter className="mr-2 size-4" />
            Status
            {status.length > 0 && (
              <Badge className="ml-2">{status.length}</Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {caseStatuses.map(item => (
            <DropdownMenuCheckboxItem
              key={item.value}
              checked={status.includes(item.value)}
              onCheckedChange={checked => {
                setStatus(
                  checked
                    ? [...status, item.value]
                    : status.filter(s => s !== item.value)
                );
              }}
            >
              <item.icon className="mr-2 size-4" />
              {item.label}
            </DropdownMenuCheckboxItem>
          ))}
          {status.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setStatus(null)}
                className="justify-center text-center"
              >
                Clear filters
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
