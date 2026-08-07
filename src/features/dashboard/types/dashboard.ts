export type PendingQuestionnaireReview = {
  clientId: string;
  clientName: string;
  eventDate: string;
  eventId: string;
  questionnaireId: string;
  submittedAt: string | null;
  title: string;
  venueName: string;
};

export type DashboardSummary = {
  activeBookings: number;
  activeLeads: number;
  confirmedEvents: number;
  pendingQuestionnaires: number;
};

export type UpcomingDashboardEvent = {
  acceptedProductNames: string[];
  bookingStatus: string;
  clientName: string;
  eventDate: string;
  eventId: string;
  guestCount: number;
  serviceStartTime: string;
  venueName: string;
};

export type DashboardMonthEvent = UpcomingDashboardEvent;
