import { zodResolver } from '@hookform/resolvers/zod';
import { FileCheck, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PageContainer, PageHeader } from '@components/layout';
import {
  Badge,
  Button,
  Card,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Typography,
} from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { extractErrorMessage } from '@utils/errors';
import { KycStatus } from '@shared/enums';

import {
  useGetMyKycQuery,
  useSubmitKycMutation,
  useUploadKycDocumentMutation,
} from '../kyc.api';

const kycFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  panNumber: z.string().optional(),
  aadhaarLast4: z.string().length(4, 'Enter last 4 digits').optional().or(z.literal('')),
  bankAccountRef: z.string().optional(),
  documentUrl: z.string().url('Enter a valid document URL').optional().or(z.literal('')),
});

type KycFormValues = z.infer<typeof kycFormSchema>;

const statusTone = (status: string): 'neutral' | 'success' | 'warning' | 'danger' => {
  switch (status) {
    case KycStatus.APPROVED:
      return 'success';
    case KycStatus.REJECTED:
      return 'danger';
    case KycStatus.UNDER_REVIEW:
      return 'warning';
    default:
      return 'neutral';
  }
};

const KycScreen = (): JSX.Element => {
  const { data, isLoading, refetch } = useGetMyKycQuery();
  const [submitKyc, submitState] = useSubmitKycMutation();
  const [uploadDoc, uploadState] = useUploadKycDocumentMutation();

  const profile = data?.profile;
  const canEdit = !profile || profile.status === KycStatus.PENDING || profile.status === KycStatus.REJECTED;

  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      fullName: profile?.fullName ?? '',
      panNumber: '',
      aadhaarLast4: '',
      bankAccountRef: '',
      documentUrl: '',
    },
  });

  const onSubmit = async (values: KycFormValues): Promise<void> => {
    const res = await submitKyc({
      fullName: values.fullName,
      panNumber: values.panNumber || undefined,
      aadhaarLast4: values.aadhaarLast4 || undefined,
      bankAccountRef: values.bankAccountRef || undefined,
    });
    if (!('data' in res)) return;

    if (values.documentUrl) {
      await uploadDoc({
        type: 'PAN',
        fileUrl: values.documentUrl,
        fileName: 'pan-document',
      });
    }
    void refetch();
  };

  return (
    <PageContainer as="div" className="gap-6">
      <PageHeader
        eyebrow="Verification"
        title="KYC verification"
        subtitle="Complete identity verification to unlock withdrawals. Documents are reviewed by our compliance team."
      />

      <Card padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {profile?.status === KycStatus.APPROVED ? (
              <ShieldCheck className="h-8 w-8 text-success" />
            ) : profile?.status === KycStatus.REJECTED ? (
              <ShieldAlert className="h-8 w-8 text-danger" />
            ) : (
              <FileCheck className="h-8 w-8 text-primary" />
            )}
            <div>
              <Typography variant="h3">Status</Typography>
              <Typography variant="body" tone="muted">
                {isLoading ? 'Loading…' : (profile?.status ?? KycStatus.PENDING)}
              </Typography>
            </div>
          </div>
          {profile?.status ? (
            <Badge tone={statusTone(profile.status)}>{profile.status.replace('_', ' ')}</Badge>
          ) : null}
        </div>

        {profile?.rejectionReason ? (
          <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3">
            <Typography variant="label" tone="danger">
              Rejection reason
            </Typography>
            <Typography variant="body">{profile.rejectionReason}</Typography>
          </div>
        ) : null}
      </Card>

      {canEdit ? (
        <Card padding="lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name (as on PAN)</FormLabel>
                    <FormControl>
                      <Input placeholder="Legal full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="panNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="ABCDE1234F" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aadhaarLast4"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aadhaar last 4 digits</FormLabel>
                      <FormControl>
                        <Input placeholder="1234" maxLength={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bankAccountRef"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank account reference</FormLabel>
                    <FormControl>
                      <Input placeholder="Account ending / UPI handle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document URL (PAN / Aadhaar / bank proof)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(submitState.error ?? uploadState.error) ? (
                <Typography variant="caption" tone="danger">
                  {extractErrorMessage(submitState.error ?? uploadState.error)}
                </Typography>
              ) : null}

              <Button type="submit" loading={submitState.isLoading || uploadState.isLoading}>
                Submit for review
              </Button>
            </form>
          </Form>
        </Card>
      ) : (
        <Card padding="md">
          <Typography variant="body" tone="muted">
            Your KYC is {profile?.status?.toLowerCase()}.{' '}
            <Button variant="link" className="px-0" onClick={() => window.location.assign(ROUTES.WALLET)}>
              Return to wallet
            </Button>
          </Typography>
        </Card>
      )}

      {(data?.documents?.length ?? 0) > 0 ? (
        <Card padding="md" className="space-y-2">
          <Typography variant="label">Uploaded documents</Typography>
          <ul className="space-y-1">
            {(data?.documents as Array<{ type: string; fileName: string }>).map((doc, idx) => (
              <li key={idx} className="text-sm text-text-muted">
                {doc.type}: {doc.fileName}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </PageContainer>
  );
};

export default KycScreen;
