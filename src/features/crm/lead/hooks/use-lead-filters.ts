import { useMemo, useState } from "react";

import type {
  EventType,
  Lead,
  LeadSource,
  LeadStatus,
} from "../types/lead";
import type { LeadDateSort, LeadListTab } from "../list/lead-list-types";
import type { SortDirection } from "../../shared/components/sortable-list-header";

export type LeadSortField = "date" | "guests" | "name" | "type";

const statusTabs: Record<LeadListTab, LeadStatus[]> = {
  active: ["new", "contacted", "waiting_on_lead"],
  converted: ["converted"],
  archived: ["lost", "spam"],
};

const belongsToTab = (lead: Lead, tab: LeadListTab) => {
  if (tab === "archived") return Boolean(lead.archivedAt);
  if (lead.archivedAt) return false;
  return statusTabs[tab].includes(lead.status);
};

export function useLeadFilters(leads: Lead[]) {
  const [activeTab, setActiveTab] = useState<LeadListTab>("active");
  const [dateSort, setDateSort] = useState<LeadDateSort>("earliest");
  const [eventType, setEventType] = useState<EventType | "">("");
  const [leadSource, setLeadSource] = useState<LeadSource | "">("");
  const [search, setSearch] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [sortField, setSortField] = useState<LeadSortField>("date");

  const counts = useMemo(() => {
    return {
      active: leads.filter((lead) => belongsToTab(lead, "active")).length,
      archived: leads.filter((lead) => belongsToTab(lead, "archived")).length,
      converted: leads.filter((lead) => belongsToTab(lead, "converted")).length,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return leads
      .filter((lead) => belongsToTab(lead, activeTab))
      .filter((lead) => !eventType || lead.eventType === eventType)
      .filter((lead) => !leadSource || lead.leadSource === leadSource)
      .filter((lead) => {
        if (!normalizedSearch) return true;

        return [lead.name, lead.email, lead.phone, lead.venueName].some(
          (value) => value.toLowerCase().includes(normalizedSearch),
        );
      })
      .sort((firstLead, secondLead) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        const values: Record<LeadSortField, [number | string, number | string]> = {
          date: [firstLead.eventDate, secondLead.eventDate],
          guests: [Number(firstLead.guestCount), Number(secondLead.guestCount)],
          name: [firstLead.name, secondLead.name],
          type: [firstLead.eventType, secondLead.eventType],
        };
        const [firstValue, secondValue] = values[sortField];
        if (typeof firstValue === "number" && typeof secondValue === "number") {
          return (firstValue - secondValue) * direction;
        }
        return String(firstValue).localeCompare(String(secondValue)) * direction;
      });
  }, [activeTab, eventType, leadSource, leads, search, sortDirection, sortField]);

  const clearFilters = () => {
    setDateSort("earliest");
    setEventType("");
    setLeadSource("");
    setSearch("");
    setSortDirection("asc");
    setSortField("date");
  };

  const updateDateSort = (value: LeadDateSort) => {
    setDateSort(value);
    setSortField("date");
    setSortDirection(value === "earliest" ? "asc" : "desc");
  };

  const updateSort = (field: LeadSortField) => {
    if (field === sortField) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      if (field === "date") {
        setDateSort((current) => (current === "earliest" ? "latest" : "earliest"));
      }
      return;
    }

    setSortField(field);
    setSortDirection("asc");
    if (field === "date") setDateSort("earliest");
  };

  return {
    activeTab,
    clearFilters,
    counts,
    dateSort,
    eventType,
    filteredLeads,
    leadSource,
    search,
    setActiveTab,
    setDateSort: updateDateSort,
    setEventType,
    setLeadSource,
    setSearch,
    setSort: updateSort,
    sortDirection,
    sortField,
  };
}
