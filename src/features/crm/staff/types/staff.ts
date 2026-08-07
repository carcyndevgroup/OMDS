import type { CrmRecordMeta } from "../../shared/types/crm-record";

export type StaffMember = CrmRecordMeta & {
  address: string;
  bankAccountNumber: string;
  bankBeneficiary: string;
  bankCardNumber: string;
  bankClabe: string;
  bankName: string;
  dateOfBirth: string;
  displayName: string;
  email: string;
  idBackFileUrl: string;
  idExpirationDate: string;
  idFrontFileUrl: string;
  idNumber: string;
  idType: string;
  isActive: boolean;
  isDriver: boolean;
  name: string;
  notes: string;
  phone: string;
};

export type StaffFormValues = {
  address: string;
  bankAccountNumber: string;
  bankBeneficiary: string;
  bankCardNumber: string;
  bankClabe: string;
  bankName: string;
  dateOfBirth: string;
  displayName: string;
  email: string;
  idBackFileUrl: string;
  idExpirationDate: string;
  idFrontFileUrl: string;
  idNumber: string;
  idType: string;
  isActive: boolean;
  isDriver: boolean;
  name: string;
  notes: string;
  phone: string;
};

export type StaffPosition =
  | "driver_a"
  | "driver_b"
  | "operator_1"
  | "operator_2"
  | "operator_3"
  | "operator_4"
  | "operator_5"
  | "operator_6"
  | "other";

export type EventStaffAssignment = {
  id: string;
  notes: string;
  position: StaffPosition;
  staffMemberId: string;
  staffName: string;
  staffPhone: string;
};

export type EventStaffFormValues = {
  notes: string;
  position: StaffPosition | "";
  staffMemberId: string;
};
