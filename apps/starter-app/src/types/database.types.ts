// Per-client database types -- generated from schema.sql

export interface User {
  id: string
  auth_id: string
  email: string
  name: string | null
  phone: string | null
  role: 'user' | 'staff' | 'manager' | 'admin'
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SiteSettings {
  id: string
  key: string
  value_json: Record<string, unknown> | null
  updated_by: string | null
  updated_at: string
}

export interface Page {
  id: string
  slug: string
  title: string
  content_json: Record<string, unknown>
  meta_description: string | null
  is_published: boolean
  updated_at: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body_html: string
  trigger_event: string | null
  is_active: boolean
  updated_at: string
}

export interface EmailLog {
  id: string
  template_id: string | null
  recipient_email: string
  subject: string | null
  status: 'sent' | 'failed' | 'bounced'
  sent_at: string
  error_message: string | null
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string | null
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  created_at: string
}

export interface AuditLogEntry {
  id: string
  user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  details_json: Record<string, unknown> | null
  created_at: string
}

export interface Media {
  id: string
  filename: string
  url: string
  mime_type: string | null
  size_bytes: number | null
  uploaded_by: string | null
  created_at: string
}

export interface ContactForm {
  id: string
  name: string
  fields_json: unknown[]
  success_message: string
  email_to: string | null
  is_active: boolean
}

export interface FormSubmission {
  id: string
  form_id: string | null
  data_json: Record<string, unknown>
  source_page: string | null
  is_read: boolean
  created_at: string
}

export interface Lead {
  id: string
  submission_id: string | null
  name: string | null
  email: string | null
  phone: string | null
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  assigned_to: string | null
  follow_up_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  duration_min: number
  price: number | null
  is_active: boolean
  max_capacity: number
  requires_prepayment: boolean
  created_at: string
}

export interface Availability {
  id: string
  service_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_recurring: boolean
  specific_date: string | null
}

export interface Booking {
  id: string
  user_id: string | null
  service_id: string | null
  date: string
  time_slot: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  parent_id: string | null
  sort_order: number
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  compare_price: number | null
  sku: string | null
  stock_qty: number
  category_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  added_at: string
}

export interface Order {
  id: string
  user_id: string | null
  total: number
  currency: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'refunded' | 'cancelled' | 'failed'
  payment_provider: string | null
  payment_id: string | null
  stripe_session_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  name: string
  quantity: number
  unit_price: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content_html: string | null
  excerpt: string | null
  author_id: string | null
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  published_at: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
}
