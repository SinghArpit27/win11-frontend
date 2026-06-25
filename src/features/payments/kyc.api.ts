import { baseApi } from '@store/api/base.api';

export interface KycProfile {
  id: string;
  status: string;
  fullName: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
}

export const kycApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyKyc: build.query<{ profile: KycProfile; documents: unknown[] }, void>({
      query: () => ({ url: '/kyc/me' }),
      providesTags: ['Kyc'],
    }),

    submitKyc: build.mutation<{ profile: KycProfile }, { fullName: string; panNumber?: string; aadhaarLast4?: string; bankAccountRef?: string }>({
      query: (body) => ({ url: '/kyc/me/submit', method: 'POST', body }),
      invalidatesTags: ['Kyc'],
    }),

    uploadKycDocument: build.mutation<
      { document: unknown },
      { type: 'PAN' | 'AADHAAR' | 'BANK_PROOF'; fileUrl: string; fileName: string; mimeType?: string }
    >({
      query: (body) => ({ url: '/kyc/me/documents', method: 'POST', body }),
      invalidatesTags: ['Kyc'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMyKycQuery, useSubmitKycMutation, useUploadKycDocumentMutation } = kycApi;
