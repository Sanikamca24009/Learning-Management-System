import API from "./client";

export interface UpdateProfileData {
  name: string;
  bio: string;
}

export interface UpdatePasswordData {
  currentPassword?: string;
  newPassword?: string;
}

export const profileApi = {
  updateProfile: (data: UpdateProfileData) =>
    API.put("/profile", data),

  updatePassword: (data: UpdatePasswordData) =>
    API.put("/profile/password", data),

  updateAvatar: (formData: FormData) =>
    API.put("/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};
