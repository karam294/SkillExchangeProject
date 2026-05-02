export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  profile_image: string | null;
  cv_file: string | null;
  date_joined?: string;
  last_login?: string | null;
}
