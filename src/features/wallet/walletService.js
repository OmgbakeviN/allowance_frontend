import { api } from "@/api/axios"

export async function getStudentWallet(studentId) {
  const { data } = await api.get(`/api/wallet/students/${studentId}/`)
  return data
}

export async function getStudentWalletTransactions(studentId) {
  const { data } = await api.get(`/api/wallet/students/${studentId}/transactions/`)
  return data
}