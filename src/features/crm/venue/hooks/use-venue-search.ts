import { useMemo, useState } from "react";

import type { SortDirection } from "../../shared/components/sortable-list-header";
import type { Venue } from "../types/venue";

export type VenueRelationshipFilter = "all" | "nonPreferred" | "preferred";
export type VenueSortField = "relationship" | "venue";
export type VenueStatusFilter = "active" | "inactive";

export function useVenueSearch(venues: Venue[]) {
  const [relationshipFilter, setRelationshipFilter] =
    useState<VenueRelationshipFilter>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VenueStatusFilter>("active");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [sortField, setSortField] = useState<VenueSortField>("venue");

  const counts = useMemo(() => {
    return {
      active: venues.filter((venue) => venue.internalStatus === "active").length,
      inactive: venues.filter((venue) => venue.internalStatus === "inactive").length,
    };
  }, [venues]);

  const filteredVenues = useMemo(() => {
    const term = search.trim().toLowerCase();
    return venues
      .filter((venue) => venue.internalStatus === statusFilter)
      .filter((venue) => {
        if (relationshipFilter === "all") return true;
        return relationshipFilter === "preferred"
          ? venue.isPreferredVendor
          : !venue.isPreferredVendor;
      })
      .filter((venue) => {
        if (!term) return true;
        return [venue.name, venue.area, venue.city]
          .join(" ")
          .toLowerCase()
          .includes(term);
      })
      .sort((first, second) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        const values: Record<VenueSortField, [string, string]> = {
          relationship: [
            first.isPreferredVendor ? "preferred" : "nonPreferred",
            second.isPreferredVendor ? "preferred" : "nonPreferred",
          ],
          venue: [first.name, second.name],
        };
        const [firstValue, secondValue] = values[sortField];
        return firstValue.localeCompare(secondValue) * direction;
      });
  }, [relationshipFilter, search, sortDirection, sortField, statusFilter, venues]);

  const clearFilters = () => {
    setRelationshipFilter("all");
    setSearch("");
    setSortDirection("asc");
    setSortField("venue");
  };

  const updateSort = (field: VenueSortField) => {
    if (field === sortField) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  return {
    clearFilters,
    counts,
    filteredVenues,
    relationshipFilter,
    search,
    setRelationshipFilter,
    setSearch,
    setStatusFilter,
    setSort: updateSort,
    sortDirection,
    sortField,
    statusFilter,
  };
}
