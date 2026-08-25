import axios from 'axios'
import { apiClient } from './client'

export type HostStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'

export type HostApplicationRequest = {
  businessName: string
  representativeName: string
  businessNumber: string
  openingDate: string
  businessPostCode: string
  businessRoadAddress: string
  businessDetailAddress: string
  latitude: number | null
  longitude: number | null
  introduction: string
  agreements: {
    hostPolicy: boolean
    privacy: boolean
    informationAccuracy: boolean
  }
}

export type HostApplicationResponse = {
  hostId: number
  status: HostStatus
  isHost: boolean
  message: string
  appliedAt: string
  approvedAt: string
}

export async function createHostApplication(
  request: HostApplicationRequest,
): Promise<HostApplicationResponse> {
  try {
    const response = await apiClient.post<HostApplicationResponse>(
      '/api/host-applications',
      request,
    )

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseMessage = error.response?.data
      if (
        typeof responseMessage === 'object' &&
        responseMessage !== null &&
        'message' in responseMessage &&
        typeof responseMessage.message === 'string'
      ) {
        throw new Error(responseMessage.message)
      }
    }

    throw new Error('호스트 등록 신청 중 오류가 발생했습니다.')
  }
}
