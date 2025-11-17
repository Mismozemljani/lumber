export type UserRole = "MAGACIN_ADMIN" | "REZERVACIJA" | "PREUZIMANJE"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  userCode?: string // Added unique user code for authentication
}

export interface Item {
  id: string
  code: string
  lokacija?: string // Added location field
  project: string
  name: string
  supplier: string
  price: number
  input: number
  output: number
  stock: number
  reserved: number
  available: number
  okov_ime?: string
  okov_cena?: number
  okov_kom?: number
  ploce_ime?: string
  ploce_cena?: number
  ploce_kom?: number
  rezervisao?: string
  vreme_rezervacije?: string
  sifra_rezervacije?: string
  preuzeo?: string
  vreme_preuzimanja?: string
  sifra_preuzimanja?: string
  low_stock_threshold: number
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  item_id: string
  quantity: number
  reserved_by: string
  reserved_at: string
  reservation_code?: string
  notes?: string
}

export interface Pickup {
  id: string
  item_id: string
  quantity: number
  picked_up_by: string
  picked_up_at: string
  confirmation_code?: string
  confirmed_at?: string
  notes?: string
}

export interface InputHistory {
  id: string
  item_id: string
  quantity: number
  price: number
  supplier: string
  input_date: string
}

export interface ImportRow {
  code: string
  lokacija?: string // Added location to import
  project: string
  name: string
  supplier: string
  price: number
  input: number
  okov_ime?: string
  okov_cena?: number
  okov_kom?: number
  ploce_ime?: string
  ploce_cena?: number
  ploce_kom?: number
  low_stock_threshold?: number
}

export interface Project {
  id: string
  name: string
  start_date: string // ISO date string
  end_date: string // ISO date string
  color: string // Added color field for project visualization
  pdf_document?: string // Added PDF document name
  pdf_url?: string // URL to uploaded PDF document
  created_at: string
  updated_at: string
}
