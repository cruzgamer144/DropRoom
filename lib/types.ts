export interface Drop {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'current' | 'upcoming';
  price: number;
  currency: string;
  image_url: string;
  drop_date: string | null;
}

export interface Reservation {
  id: string;
  size: string | null;
  status: string;
  created_at: string;
  drop: Drop;
}

export interface Profile {
  id: string;
  email: string;
  monthly_limit: number;
  items_this_month: number;
  limit_refreshed_at: string;
}
