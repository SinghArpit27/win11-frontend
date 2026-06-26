import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@components/ui';
import { ContestType, ContestVisibility } from '@shared/enums';
import { extractErrorMessage } from '@utils/errors';

import {
  useAdminCreateTemplateMutation,
  useAdminListPrizeDistributionsQuery,
  useAdminUpdateTemplateMutation,
} from '../../contest.api';
import {
  adminTemplateFormSchema,
  type AdminTemplateFormValues,
} from '../../admin.contest.schemas';
import { templateFormToPayload, templateToFormValues } from '../../admin.contest.utils';
import type { ContestTemplate } from '../../contest.types';

const DEFAULT_VALUES: AdminTemplateFormValues = {
  name: '',
  description: '',
  type: ContestType.REGULAR,
  visibility: ContestVisibility.PUBLIC,
  entryFeeMajor: 10,
  prizePoolMajor: 100,
  totalSpots: 100,
  maxEntriesPerUser: 5,
  isGuaranteed: false,
  prizeDistributionId: null,
  isActive: true,
};

interface AdminTemplateFormModalProps {
  open: boolean;
  template: ContestTemplate | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AdminTemplateFormModal = ({
  open,
  template,
  onOpenChange,
  onSuccess,
}: AdminTemplateFormModalProps): JSX.Element => {
  const isEdit = Boolean(template);
  const [createTemplate, createState] = useAdminCreateTemplateMutation();
  const [updateTemplate, updateState] = useAdminUpdateTemplateMutation();
  const prizesQuery = useAdminListPrizeDistributionsQuery({ isActive: true, limit: 50 });

  const form = useForm<AdminTemplateFormValues>({
    resolver: zodResolver(adminTemplateFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      createState.reset();
      updateState.reset();
      return;
    }
    form.reset(template ? templateToFormValues(template) : DEFAULT_VALUES);
  }, [open, template, form, createState, updateState]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = templateFormToPayload(values);
    try {
      if (template) {
        await updateTemplate({ templateId: template.id, body: payload }).unwrap();
      } else {
        await createTemplate(payload).unwrap();
      }
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // RTK mutation error surfaced below
    }
  });

  const error = createState.error ?? updateState.error;
  const pending = createState.isLoading || updateState.isLoading;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <ModalHeader>
          <ModalTitle>{isEdit ? 'Edit contest template' : 'Create contest template'}</ModalTitle>
        </ModalHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4 px-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Mega Contest — 1L Prize Pool" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                      >
                        {Object.values(ContestType).map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                      >
                        {Object.values(ContestVisibility).map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="entryFeeMajor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry fee (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prizePoolMajor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prize pool (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="totalSpots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total spots</FormLabel>
                    <FormControl>
                      <Input type="number" min={2} step={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxEntriesPerUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max entries / user</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} step={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="prizeDistributionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prize distribution</FormLabel>
                  <FormControl>
                    <select
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                    >
                      <option value="">None (practice / inline later)</option>
                      {(prizesQuery.data?.items ?? []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register('isGuaranteed')} />
                Guaranteed prize pool
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register('isActive')} />
                Active template
              </label>
            </div>
            {error ? (
              <p className="text-sm text-danger">{extractErrorMessage(error)}</p>
            ) : null}
            <ModalFooter className="px-0">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {isEdit ? 'Save template' : 'Create template'}
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
