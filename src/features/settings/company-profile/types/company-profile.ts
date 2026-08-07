export type CompanyProfile = {
  legalName: string;
  dbaName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
};

export type CompanyProfileResponse = {
  data: CompanyProfile;
};
