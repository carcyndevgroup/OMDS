"use client";

import { useMemo, useState } from "react";

import type { EventType } from "../../shared/types/crm-options";
import type { EventListItem } from "../types/event";

export type EventDateSort = "earliest" | "latest";
export type EventSortDirection = "asc" | "desc";
export type EventSortField = "client" | "date" | "guests" | "venue";
export type EventTypeFilter = "all" | EventType;

export function useEventFilters(events: EventListItem[]) {
  const [dateSort, setDateSort] = useState<EventDateSort>("earliest");
  const [eventType, setEventType] = useState<EventTypeFilter>("all");
  const [search, setSearch] = useState("");
  const [sortDirection, setSortDirection] = useState<EventSortDirection>("asc");
  const [sortField, setSortField] = useState<EventSortField>("date");

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events
      .filter((event) => eventType === "all" || event.eventType === eventType)
      .filter((event) => {
        if (!query) return true;
        return [event.clientName, event.venueName, ...event.plannerNames].some(
          (value) => value.toLowerCase().includes(query),
        );
      })
      .sort((first, second) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        const values: Record<EventSortField, [string | number, string | number]> = {
          client: [first.clientName, second.clientName],
          date: [first.eventDate, second.eventDate],
          guests: [first.guestCount, second.guestCount],
          venue: [first.venueName, second.venueName],
        };
        const [firstValue, secondValue] = values[sortField];
        if (typeof firstValue === "number" && typeof secondValue === "number") {
          return (firstValue - secondValue) * direction;
        }
        return String(firstValue).localeCompare(String(secondValue)) * direction;
      });
  }, [eventType, events, search, sortDirection, sortField]);

  const clearFilters = () => {
    setDateSort("earliest");
    setEventType("all");
    setSearch("");
    setSortDirection("asc");
    setSortField("date");
  };

  const updateDateSort = (value: EventDateSort) => {
    setDateSort(value);
    setSortField("date");
    setSortDirection(value === "earliest" ? "asc" : "desc");
  };

  const updateSort = (field: EventSortField) => {
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
    clearFilters,
    dateSort,
    eventType,
    filteredEvents,
    search,
    setEventType,
    setSearch,
    setSort: updateSort,
    setDateSort: updateDateSort,
    sortDirection,
    sortField,
  };
}
