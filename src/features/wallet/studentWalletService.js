import { api } from "@/api/axios"

export async function getMyWallet() {
  const { data } = await api.get("/api/wallet/me/")
  return data
}

export async function updateMyWalletSettings(payload) {
  const { data } = await api.patch("/api/wallet/me/settings/", payload)
  return data
}

export async function getMyWalletTransactions() {
  const { data } = await api.get("/api/wallet/me/transactions/")
  return data
}