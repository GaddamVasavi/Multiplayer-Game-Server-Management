export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  displayName: string;
  eloRating: number;
  avatarUrl?: string;
}

export class AuthResponseDto {
  accessToken: string;
  tokenType: string = 'Bearer';
  expiresIn: number = 86400; // 24 hours
  user: UserResponseDto;
}
