"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { apiRequest, API_URL, type AppUser, type ItemSummary } from "./api"
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
      error: error instanceof Error ? error.message : "Não foi possível salvar.",
    }
  }
}

export async function uploadAvatarAction(formData: FormData) {
  const file = formData.get("avatar")

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: "Selecione uma imagem válida." }
  }

  try {
    const upload = new FormData()
    upload.append("avatar", file)

    const user = await apiRequest<AppUser>("/api/accounts/me/", {
      method: "PATCH",
      body: upload,
    })
    await storeCurrentUser(user)
    revalidatePath("/account")
    return { ok: true as const, user }
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a foto.",
    }
  }
}

export async function updateUserStatusAction(status: AppUser["status"]) {
  return updateProfileAction({ status })
}

export async function requestPasswordResetAction(login: string) {
  try {
    await apiRequest<Record<string, never>>("/api/auth/password/reset/", {
      method: "POST",
      auth: false,
      body: { email: login, login },
    })
  } catch {
    // Mantém resposta genérica para não vazar existência da conta
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
    revalidatePath("/loans")
    return { ok: true, loan }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Não foi possível reservar.",
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
      error: error instanceof Error ? error.message : "Não foi possível enviar a avaliação.",
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
      error: error instanceof Error ? error.message : "Não foi possível enviar a denúncia.",
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
      error: error instanceof Error ? error.message : "Não foi possível abrir a conversa.",
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
      error: error instanceof Error ? error.message : "Não foi possível enviar a mensagem.",
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

type ItemUpdatePayload = Partial<ItemPayload>

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
      error: error instanceof Error ? error.message : "Não foi possível criar o item.",
    }
  }
}

export async function updateItemAction(id: string, data: ItemUpdatePayload) {
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
      error: error instanceof Error ? error.message : "Não foi possível atualizar o item.",
    }
  }
}

export async function updateItemReservationAction(
  id: string,
  allow_reservation: boolean
) {
  return updateItemAction(id, { allow_reservation })
}

export async function uploadItemImageAction(formData: FormData) {
  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: "Selecione uma imagem válida." }
  }

  try {
    const upload = new FormData()
    upload.append("file", file)

    const { url } = await apiRequest<{ url: string }>(
      "/api/items/images/upload/",
      {
        method: "POST",
        body: upload,
      }
    )

    return { ok: true as const, url }
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a imagem.",
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
      error: error instanceof Error ? error.message : "Não foi possível excluir o item.",
    }
  }
}

async function loanTransitionAction(id: string, action: string) {
  try {
    await apiRequest(`/api/loans/${id}/${action}/`, {
      method: "POST",
      body: {},
    })
    revalidatePath("/loans")
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a ação.",
    }
  }
}

export async function approveLoanAction(id: string) {
  return loanTransitionAction(id, "approve")
}

export async function rejectLoanAction(id: string) {
  return loanTransitionAction(id, "reject")
}

export async function cancelLoanAction(id: string) {
  return loanTransitionAction(id, "cancel")
}

export async function pickupLoanAction(id: string) {
  return loanTransitionAction(id, "pickup")
}

export async function returnLoanAction(id: string) {
  return loanTransitionAction(id, "return")
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
