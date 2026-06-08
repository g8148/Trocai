"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { apiRequest, type AppUser, API_URL, type ItemSummary } from "./api"
import { getAccessToken } from "./auth"

const USER_COOKIE_MAX_AGE = 7 * 24 * 60 * 60

async function storeCurrentUser(user: AppUser) {
  const store = await cookies()
  store.set("trocai_user", JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: USER_COOKIE_MAX_AGE,
    path: "/",
  })
}

export async function updateProfileAction(data: Partial<AppUser>) {
  try {
    const user = await apiRequest<AppUser>("/api/accounts/me/", {
      method: "PATCH",
      body: data,
    })
    await storeCurrentUser(user)
    revalidatePath("/account")
    return { ok: true, user }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Nao foi possivel salvar.",
    }
  }
}

export async function updateUserStatusAction(status: AppUser["status"]) {
  return updateProfileAction({ status })
}

export async function updateDistanceAction(search_radius_km: number) {
  return updateProfileAction({ search_radius_km })
}

export async function requestPasswordResetAction(login: string) {
  try {
    await apiRequest<Record<string, never>>("/api/auth/password/reset/", {
      method: "POST",
      auth: false,
      body: { email: login, login },
    })
  } catch {
    // Mantem resposta generica para nao vazar existencia da conta
  }

  return { ok: true }
}

export async function createLoanAction(data: {
  item: string
  pickup_date: string
  expected_return_date?: string
  borrower_notes?: string
}) {
  try {
    const loan = await apiRequest("/api/loans/", {
      method: "POST",
      body: data,
    })
    revalidatePath("/")
    return { ok: true, loan }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Nao foi possivel reservar.",
    }
  }
}

export async function createReviewAction(data: {
  loan: string
  item_rating: number
  user_rating: number
  description: string
}) {
  try {
    await apiRequest("/api/reviews/", {
      method: "POST",
      body: data,
    })
    revalidatePath("/account")
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Nao foi possivel enviar a avaliacao.",
    }
  }
}

export async function createReportAction(data: {
  target_type: "usuario" | "item" | "emprestimo"
  target_user?: string
  target_item?: string
  target_loan?: string
  reason: string
  description: string
}) {
  try {
    await apiRequest("/api/reports/", {
      method: "POST",
      body: data,
    })
    revalidatePath("/account")
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Nao foi possivel enviar a denuncia.",
    }
  }
}

export async function createConversationAction(data: {
  item?: string
  target_user: string
}) {
  try {
    const conversation = await apiRequest<{ id: string }>("/api/chat/", {
      method: "POST",
      body: data,
    })
    revalidatePath("/chat")
    return { ok: true, id: conversation.id }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Nao foi possivel abrir a conversa.",
    }
  }
}

export async function sendMessageAction(conversationId: string, content: string) {
  try {
    await apiRequest(`/api/chat/${conversationId}/messages/`, {
      method: "POST",
      body: { content },
    })
    revalidatePath(`/chat/${conversationId}`)
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Nao foi possivel enviar a mensagem.",
    }
  }
}

export async function markNotificationReadAction(id: string) {
  try {
    await apiRequest(`/api/notifications/${id}/read/`, {
      method: "POST",
      body: {},
    })
    revalidatePath("/notifications")
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

type ItemPayload = {
  name: string
  description: string
  subcategory: string
  condition: string
  segregation: string
  allow_reservation: boolean
  estimated_value?: string | null
  image_urls?: string[]
}

export async function createItemAction(data: ItemPayload) {
  try {
    const item = await apiRequest<ItemSummary>("/api/items/", {
      method: "POST",
      body: data,
    })
    revalidatePath("/")
    revalidatePath("/account")
    revalidatePath("/account/items")
    return { ok: true, item, id: item.id }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Nao foi possivel criar o item.",
    }
  }
}

export async function updateItemAction(id: string, data: ItemPayload) {
  try {
    const item = await apiRequest<ItemSummary>(`/api/items/${id}/`, {
      method: "PATCH",
      body: data,
    })
    revalidatePath("/")
    revalidatePath("/account")
    revalidatePath("/account/items")
    revalidatePath(`/items/${id}`)
    return { ok: true, item }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Nao foi possivel atualizar o item.",
    }
  }
}

export async function deleteItemAction(id: string) {
  try {
    await apiRequest(`/api/items/${id}/`, {
      method: "DELETE",
    })
    revalidatePath("/")
    revalidatePath("/account")
    revalidatePath("/account/items")
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Nao foi possivel deletar o item.",
    }
  }
}

export async function submitSupportAction() {
  return { ok: true }
}

export async function fetchApiHealthAction() {
  try {
    const accessToken = await getAccessToken()
    const res = await fetch(`${API_URL}/api/docs/`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      cache: "no-store",
    })
    return { ok: res.ok }
  } catch {
    return { ok: false }
  }
}
