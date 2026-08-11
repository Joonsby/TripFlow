import { apiClient } from './client'

export type BusinessVerificationRequest = {
  businessName: string
  representativeName: string
  businessNumber: string
  openingDate: string
}

export type BusinessVerificationResponse = {
  verified: boolean
  message: string
}

export async function verifyBusiness(
  request: BusinessVerificationRequest,
): Promise<BusinessVerificationResponse> {
  const response = await apiClient.post<BusinessVerificationResponse>(
    '/api/business-verifications',
    request,
  )
  return response.data
}
