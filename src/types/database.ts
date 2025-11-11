export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "member" | "admin";
  monthly_limit: number;
  monthly_count: number;
  month_key: string;
  status: "active" | "suspended" | "pending";
  created_at: string;
};

export type Drop = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  drop_date: string;
  active: boolean;
  sizes: string[];
  created_at: string;
};

export type ReservationStatus = "reservado" | "pago" | "enviado" | "cancelado";

export type Reservation = {
  id: string;
  user_id: string;
  drop_id: string;
  size: string;
  status: ReservationStatus;
  created_at: string;
  month_key: string;
  drop?: {
    name: string;
    slug: string;
    image_url: string | null;
    price: number;
  } | null;
};

export type Invite = {
  id: string;
  code: string;
  email: string | null;
  created_by: string | null;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  status: "active" | "used" | "revoked";
};

export type DropWithReservations = Drop & {
  reservations: Reservation[];
};
