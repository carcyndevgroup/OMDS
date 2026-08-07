"use client";

import { useMemo, useState } from "react";

import type { SortDirection } from "../../shared/components/sortable-list-header";
import type { Planner } from "../types/planner";

export type PlannerCommissionFilter =
  | "all"
  | "case_by_case"
  | "fixed_amount"
  | "fixed_percentage"
  | "none"
  | "notes_only";
export type PlannerStatusFilter = "active" | "inactive";
export type PlannerSortField = "contact" | "planner";

export function usePlannerSearch(planners: Planner[]) {
  const [commissionFilter, setCommissionFilter] =
    useState<PlannerCommissionFilter>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PlannerStatusFilter>("active");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [sortField, setSortField] = useState<PlannerSortField>("planner");

  const counts = useMemo(() => {
    return {
      active: planners.filter((planner) => planner.internalStatus === "active").length,
      inactive: planners.filter((planner) => planner.internalStatus === "inactive").length,
    };
  }, [planners]);

  const filteredPlanners = useMemo(() => {
    const query = search.trim().toLowerCase();

    return planners
      .filter((planner) => planner.internalStatus === statusFilter)
      .filter((planner) => {
        if (commissionFilter === "all") return true;
        return planner.defaultCommissionModel === commissionFilter;
      })
      .filter((planner) => {
        if (!query) return true;
        return [planner.name, planner.companyName, planner.email, planner.city]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((first, second) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        const values: Record<PlannerSortField, [string, string]> = {
          contact: [first.email || first.phone, second.email || second.phone],
          planner: [first.name, second.name],
        };
        const [firstValue, secondValue] = values[sortField];
        return firstValue.localeCompare(secondValue) * direction;
      });
  }, [commissionFilter, planners, search, sortDirection, sortField, statusFilter]);

  const clearFilters = () => {
    setCommissionFilter("all");
    setSearch("");
    setSortDirection("asc");
    setSortField("planner");
  };

  const updateSort = (field: PlannerSortField) => {
    if (field === sortField) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  return {
    clearFilters,
    commissionFilter,
    counts,
    filteredPlanners,
    search,
    setCommissionFilter,
    setSearch,
    setStatusFilter,
    setSort: updateSort,
    sortDirection,
    sortField,
    statusFilter,
  };
}
