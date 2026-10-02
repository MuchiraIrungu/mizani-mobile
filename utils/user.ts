import { UserInfo, UserResponseDto } from "@/types/users";

export function toUserInfo(user: UserResponseDto): UserInfo {
  return {
    initials:
      `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase(),
    name: `${user.firstName} ${user.lastName}`,
    firstName: user.firstName,
    businessId: user.businessId,
    role: user.role,
  };
}
