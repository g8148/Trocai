import "server-only"

import { getAccessToken, getCurrentUser, type AuthUser } from "./auth"

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export interface AppUser extends AuthUser {
  cpf: string
  phone: string
  zip_code: string
  street: string
  neighborhood: string
  city: string
  state: string
  latitude: string | null
  longitude: string | null
  search_radius_km: number
  status: "available" | "away" | "blocked"
  email_verified: boolean
  phone_verified: boolean
}

export interface ApiListResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface CategoryOption {
  id: string
  name: string
}

export interface CategoryGroup {
  id: string
  name: string
  type: "tool" | "service"
  icon: string
  subcategories: CategoryOption[]
}

export interface ItemOwner {
  id: string
  username: string
  first_name: string
  avatar: string | null
}

export interface ItemImage {
  id: string
  image: string
  is_cover: boolean
}

export interface ItemSummary {
  id: string
  name: string
  description: string
  owner: ItemOwner
  subcategory: string | null
  subcategory_name: string | null
  category_name: string | null
  category_type: "tool" | "service" | null
  segregation: string
  condition: string
  estimated_value: string | null
  availability: string
  allow_reservation: boolean
  cover_image: string | null
  images: ItemImage[]
  created_at: string
}

export interface NotificationEntry {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  related_object_type: string
  related_object_id: string | null
  created_at: string
}

export interface ChatParticipant {
  id: string
  username: string
  first_name: string
  avatar: string | null
}

export interface MessageEntry {
  id: string
  conversation: string
  sender: ChatParticipant
  content: string
  is_read: boolean
  created_at: string
}

export interface ConversationEntry {
  id: string
  participants: ChatParticipant[]
  item: string | null
  item_name: string | null
  last_message: MessageEntry | null
  created_at: string
  updated_at: string
}

export interface LoanEntry {
  id: string
  item: string
  item_name: string | null
  borrower: ChatParticipant
  lender: ChatParticipant
  status: string
  pickup_date: string
  expected_return_date: string | null
  actual_return_date: string | null
  borrower_notes: string
  lender_notes: string
  requested_at: string
  updated_at: string
}

export interface ReviewEntry {
  id: string
  loan: string
  reviewer: ChatParticipant
  reviewed_user: ChatParticipant
  item_rating: number
  user_rating: number
  description: string
  image: string | null
  created_at: string
}

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH"
  auth?: boolean
  body?: FormData | Record<string, unknown>
}

function normalizeErrorMessage(detail: unknown) {
  if (typeof detail === "string") {
    return detail
  }

  if (Array.isArray(detail) && typeof detail[0] === "string") {
    return detail[0]
  }

  return "Nao foi possivel concluir a requisicao."
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = "GET", auth = true, body } = options
  const headers = new Headers()

  if (!(body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  if (auth) {
    const accessToken = await getAccessToken()
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`)
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    cache: "no-store",
    body:
      method === "GET"
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body ?? {}),
  })

  if (!res.ok) {
    let detail: unknown = null
    try {
      detail = await res.json()
    } catch {
      detail = null
    }
    throw new Error(normalizeErrorMessage(detail))
  }

  if (res.status === 204) {
    return null as T
  }

  // Algumas respostas 200 vêm sem corpo (ex.: transições de empréstimo).
  // Ler como texto e só parsear se houver conteúdo evita "Unexpected end of JSON input".
  const text = await res.text()
  return (text ? (JSON.parse(text) as T) : (null as T))
}

async function safeRequest<T>(request: () => Promise<T>, fallback: T) {
  try {
    return await request()
  } catch {
    return fallback
  }
}

export async function getMe() {
  const fallback = await getCurrentUser()
  return safeRequest<AppUser | null>(
    () => apiRequest<AppUser>("/api/accounts/me/"),
    (fallback as AppUser | null) ?? null
  )
}

export async function getItems(
  search?: string,
  type?: "tool" | "service",
  owner?: string,
  condition?: string,
  availability?: string,
  segregation?: string,
) {
  const params = new URLSearchParams()
  if (search) params.set("search", search)
  if (type) params.set("type", type)
  if (owner) params.set("owner", owner)
  if (condition) params.set("condition", condition)
  if (availability) params.set("availability", availability)
  if (segregation) params.set("segregation", segregation)

  const query = params.toString()
  const path = `/api/items/${query ? `?${query}` : ""}`
  const response = await safeRequest<ApiListResponse<ItemSummary>>(
    () => apiRequest<ApiListResponse<ItemSummary>>(path),
    { count: 0, next: null, previous: null, results: [] }
  )

  return response.results
}

export async function getItem(id: string) {
  return safeRequest<ItemSummary | null>(
    () => apiRequest<ItemSummary>(`/api/items/${id}/`),
    null
  )
}

export async function getCategories(type?: "tool" | "service") {
  const query = type ? `?type=${type}` : ""
  return safeRequest<CategoryGroup[]>(
    () => apiRequest<CategoryGroup[]>(`/api/items/categories/${query}`),
    []
  )
}

export async function getNotifications() {
  const response = await safeRequest<ApiListResponse<NotificationEntry>>(
    () => apiRequest<ApiListResponse<NotificationEntry>>("/api/notifications/"),
    { count: 0, next: null, previous: null, results: [] }
  )
  return response.results
}

export async function getConversations() {
  const response = await safeRequest<ApiListResponse<ConversationEntry>>(
    () => apiRequest<ApiListResponse<ConversationEntry>>("/api/chat/"),
    { count: 0, next: null, previous: null, results: [] }
  )
  return response.results
}

export async function getConversation(id: string) {
  return safeRequest<ConversationEntry | null>(
    () => apiRequest<ConversationEntry>(`/api/chat/${id}/`),
    null
  )
}

export async function getMessages(conversationId: string) {
  const response = await safeRequest<ApiListResponse<MessageEntry>>(
    () => apiRequest<ApiListResponse<MessageEntry>>(`/api/chat/${conversationId}/messages/`),
    { count: 0, next: null, previous: null, results: [] }
  )
  return response.results
}

export async function getLoans() {
  const response = await safeRequest<ApiListResponse<LoanEntry>>(
    () => apiRequest<ApiListResponse<LoanEntry>>("/api/loans/"),
    { count: 0, next: null, previous: null, results: [] }
  )
  return response.results
}
