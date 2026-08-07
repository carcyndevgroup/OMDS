export type EventFile = {
  createdAt: string;
  fileName: string;
  fileUrl: string;
  id: string;
  includeOnRunSheet: boolean;
  notes: string;
};

export type EventFileFormValues = {
  fileName: string;
  fileUrl: string;
  includeOnRunSheet: boolean;
  notes: string;
};
