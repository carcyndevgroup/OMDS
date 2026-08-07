import { useMemo, useState } from "react";

import type { SortDirection } from "../../shared/components/sortable-list-header";
import type { ClientListItem } from "../types/client";

export type ClientDateSort = "earliest" | "latest";
export type ClientListView = "active" | "confirmed" | "archived";
export type ClientSortField = "client" | "contact" | "date" | "venue";

const viewStatuses: Record<ClientListView, string[]> = {
  active: ["quote_requested", "proposal_sent", "tentative_hold"],
  archived: ["cancelled", "lost"],
  confirmed: ["confirmed"],
};

const belongsToView = (client: ClientListItem, view: ClientListView) => {
  if (view === "archived") return Boolean(client.archivedAt);
  if (client.archivedAt) return false;
  const status = client.nextEvent?.bookingStatus;
  return Boolean(status && viewStatuses[view].includes(status));
};

export function useClientFilters(clients: ClientListItem[]) {
  const [activeView, setActiveView] = useState<ClientListView>("active");
  const [dateSort, setDateSort] = useState<ClientDateSort>("earliest");
  const [search, setSearch] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [sortField, setSortField] = useState<ClientSortField>("date");

  const counts = useMemo(() => {
    return {
      active: clients.filter((client) => belongsToView(client, "active")).length,
      archived: clients.filter((client) => belongsToView(client, "archived")).length,
      confirmed: clients.filter((client) => belongsToView(client, "confirmed")).length,
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();

    return clients
      .filter((client) => belongsToView(client, activeView))
      .filter((client) => {
        if (!term) return true;
        const name = `${client.firstName} ${client.lastName}`;
        return [name, client.companyName, client.email, client.phone].some(
          (value) => value.toLowerCase().includes(term),
        );
      })
      .sort((first, second) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        const values: Record<ClientSortField, [string, string]> = {
          client: [`${first.firstName} ${first.lastName}`, `${second.firstName} ${second.lastName}`],
          contact: [first.email, second.email],
          date: [first.nextEvent?.eventDate ?? "", second.nextEvent?.eventDate ?? ""],
          venue: [first.nextEvent?.venueName ?? "", second.nextEvent?.venueName ?? ""],
        };
        const [firstValue, secondValue] = values[sortField];
        return firstValue.localeCompare(secondValue) * direction;
      });
  }, [activeView, clients, search, sortDirection, sortField]);

  const clearFilters = () => {
    setDateSort("earliest");
    setSearch("");
    setSortDirection("asc");
    setSortField("date");
  };

  const updateDateSort = (value: ClientDateSort) => {
    setDateSort(value);
    setSortField("date");
    setSortDirection(value === "earliest" ? "asc" : "desc");
  };

  const updateSort = (field: ClientSortField) => {
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
    activeView,
    clearFilters,
    counts,
    dateSort,
    filteredClients,
    search,
    setActiveView,
    setDateSort: updateDateSort,
    setSearch,
    setSort: updateSort,
    sortDirection,
    sortField,
  };
}
