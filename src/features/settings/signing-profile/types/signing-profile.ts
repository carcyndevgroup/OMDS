export type SigningProfile = {
  authorizedSignerFullName: string;
  authorizedSignerTitle: string;
};

export type SigningProfileResponse = {
  data: SigningProfile;
};
