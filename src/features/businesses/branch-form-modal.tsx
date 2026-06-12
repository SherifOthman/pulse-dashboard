import { AppSelect } from "@/components/app-select";
import { MapPicker, type MapPickerValue } from "@/components/map-picker";
import type { CityDto, GovernorateDto } from "@/features/cities/types";
import { PhoneNumbersField } from "@/features/doctors/components/phone-numbers-field";
import {
  WorkingDaysField,
  defaultWorkingDays,
  formToWorkingDays,
  mapWorkingDaysToForm,
} from "@/features/doctors/components/working-days-field";
import api from "@/services/api";
import type { BranchDetails, CreateBranchDto } from "@/types/shared";
import { Button, Input, Modal, TextField, Label, FieldError } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const timeRegex = /^\d{2}:\d{2}$/;

const branchFormSchema = z
  .object({
    name: z.string().min(1, "اسم الفرع مطلوب").max(100, "الاسم طويل جداً"),
    governorateId: z.string().min(1, "المحافظة مطلوبة"),
    cityId: z.string().min(1, "المدينة مطلوبة"),
    address: z.string().max(500, "العنوان طويل جداً").optional(),
    visitPrice: z.string().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    workingDays: z
      .array(
        z.object({
          day: z.number(),
          startTime: z.string(),
          endTime: z.string(),
          enabled: z.boolean(),
        }),
      )
      .refine((days) => days.some((d) => d.enabled), {
        message: "يجب اختيار يوم عمل واحد على الأقل",
        path: ["workingDays"],
      }),
    phoneNumbers: z.array(
      z.object({
        number: z.string().min(1, "رقم الهاتف مطلوب"),
        type: z.string().optional(),
      }),
    ),
  })
  .refine((data) => !data.governorateId || !!data.cityId, {
    message: "يجب اختيار المدينة عند اختيار المحافظة",
    path: ["cityId"],
  })
  .refine(
    (data) => {
      for (const day of data.workingDays) {
        if (!day.enabled) continue;
        if (!timeRegex.test(day.startTime) || !timeRegex.test(day.endTime))
          return false;
        if (day.startTime >= day.endTime) return false;
      }
      return true;
    },
    {
      message: "أوقات العمل غير صحيحة (يجب أن تكون البداية قبل النهاية)",
      path: ["workingDays"],
    },
  )
  .refine(
    (data) =>
      data.latitude == null || (data.latitude >= -90 && data.latitude <= 90),
    { message: "خط العرض يجب أن يكون بين -90 و 90", path: ["latitude"] },
  )
  .refine(
    (data) =>
      data.longitude == null ||
      (data.longitude >= -180 && data.longitude <= 180),
    { message: "خط الطول يجب أن يكون بين -180 و 180", path: ["longitude"] },
  );

type BranchFormValues = z.infer<typeof branchFormSchema>;

const defaultValues: BranchFormValues = {
  name: "",
  governorateId: "",
  cityId: "",
  address: "",
  visitPrice: "",
  latitude: null,
  longitude: null,
  workingDays: defaultWorkingDays,
  phoneNumbers: [],
};

function Field({
  label,
  required,
  error,
  isInvalid,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  isInvalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <TextField isInvalid={isInvalid} validationBehavior="aria" className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-danger ms-0.5">*</span>}
      </Label>
      {children}
      {error && <FieldError className="text-xs text-danger">{error}</FieldError>}
    </TextField>
  );
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateBranchDto) => void;
  isLoading?: boolean;
  initial?: BranchDetails | null;
  /** Show the visit price field — only relevant for doctor branches */
  showVisitPrice?: boolean;
};

export function BranchFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initial,
  showVisitPrice = false,
}: Props) {
  const methods = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = methods;

  const governorateId = watch("governorateId");
  const nameValue = watch("name");

  const { data: governorates = [] } = useQuery<GovernorateDto[]>({
    queryKey: ["governorates"],
    queryFn: async () => (await api.get("/governorates")).data,
  });

  const { data: cities = [] } = useQuery<CityDto[]>({
    queryKey: ["cities-by-gov", governorateId],
    queryFn: async () =>
      (await api.get("/cities", { params: { governorateId } })).data,
    enabled: !!governorateId,
  });

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        reset({
          name: initial.name,
          governorateId: initial.governorateId || "",
          cityId: initial.cityId || "",
          address: initial.address || "",
          visitPrice:
            initial.visitPrice?.toString() || "",
          latitude: initial.latitude ?? null,
          longitude: initial.longitude ?? null,
          workingDays: mapWorkingDaysToForm(initial.workingDays),
          phoneNumbers: initial.phoneNumbers.map((p) => ({
            number: p.number,
            type: p.type || "",
          })),
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [initial, isOpen, reset]);

  const onFormSubmit = (data: BranchFormValues) => {
    onSubmit({
      name: data.name.trim(),
      cityId: data.cityId || undefined,
      address: data.address?.trim() || undefined,
      visitPrice: data.visitPrice ? parseFloat(data.visitPrice) : undefined,
      latitude: data.latitude ?? undefined,
      longitude: data.longitude ?? undefined,
      workingDays: formToWorkingDays(data.workingDays),
      phoneNumbers:
        data.phoneNumbers
          .filter((p) => p.number.trim())
          .map((p) => ({
            number: p.number.trim(),
            type: p.type?.trim() || null,
          })) || undefined,
    });
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Container size="lg">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              {initial ? "تعديل الفرع" : "إضافة فرع جديد"}
            </Modal.Heading>
          </Modal.Header>

          <Modal.Body
            dir="rtl"
            className="flex flex-col gap-5 overflow-y-auto max-h-[65vh]"
          >
            <FormProvider {...methods}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Field
                    label="اسم الفرع"
                    required
                    error={errors.name?.message}
                    isInvalid={!!errors.name}
                  >
                    <Input
                      {...field}
                      variant="secondary"
                      placeholder="اسم الفرع"
                    />
                  </Field>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="governorateId"
                  control={control}
                  render={({ field }) => (
                    <Field
                      label="المحافظة"
                      error={errors.governorateId?.message}
                    >
                      <AppSelect
                        variant="secondary"
                        isInvalid={!!errors.governorateId}
                        options={governorates.map((g) => ({
                          id: g.id,
                          label: g.name,
                        }))}
                        value={field.value || ""}
                        onChange={(val) => {
                          field.onChange(val);
                          setValue("cityId", "");
                        }}
                        placeholder="اختر المحافظة"
                      />
                    </Field>
                  )}
                />
                <Controller
                  name="cityId"
                  control={control}
                  render={({ field }) => (
                    <Field label="المدينة" error={errors.cityId?.message}>
                      <AppSelect
                        variant="secondary"
                        isInvalid={!!errors.cityId}
                        options={cities.map((c) => ({
                          id: c.id,
                          label: c.name,
                        }))}
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="اختر المدينة"
                        isDisabled={!governorateId}
                      />
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Field label="العنوان" error={errors.address?.message} isInvalid={!!errors.address}>
                    <Input
                      {...field}
                      variant="secondary"
                      placeholder="عنوان الفرع"
                    />
                  </Field>
                )}
              />

              {showVisitPrice && (
                <Controller
                  name="visitPrice"
                  control={control}
                  render={({ field }) => (
                    <Field label="سعر الكشف (ج.م)" error={errors.visitPrice?.message} isInvalid={!!errors.visitPrice}>
                      <Input
                        {...field}
                        variant="secondary"
                        type="number"
                        min="0"
                        placeholder="0"
                      />
                    </Field>
                  )}
                />
              )}

              <PhoneNumbersField />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  الموقع على الخريطة
                </label>
                <p className="text-xs text-muted -mt-1">
                  انقر على الخريطة أو ابحث لتحديد موقع الفرع
                </p>
                {errors.latitude?.message && (
                  <p className="text-xs text-danger">
                    {errors.latitude.message}
                  </p>
                )}
                {errors.longitude?.message && (
                  <p className="text-xs text-danger">
                    {errors.longitude.message}
                  </p>
                )}
                <Controller
                  name="latitude"
                  control={control}
                  render={({ field: latField }) => (
                    <Controller
                      name="longitude"
                      control={control}
                      render={({ field: lngField }) => {
                        const value: MapPickerValue =
                          latField.value != null && lngField.value != null
                            ? { lat: latField.value, lng: lngField.value }
                            : null;
                        return (
                          <MapPicker
                            value={value}
                            onChange={(v) => {
                              latField.onChange(v?.lat ?? null);
                              lngField.onChange(v?.lng ?? null);
                            }}
                            height={260}
                          />
                        );
                      }}
                    />
                  )}
                />
              </div>

              <div className="[&_[data-slot=checkbox-control]]:border [&_[data-slot=checkbox-control]]:border-divider [&_[data-slot=checkbox-control]]:rounded">
                <WorkingDaysField />
              </div>
            </FormProvider>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="ghost" onPress={onClose} isDisabled={isLoading}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              onPress={() => handleSubmit(onFormSubmit)()}
              isPending={isLoading}
              isDisabled={!nameValue?.trim()}
            >
              {initial ? "حفظ التعديلات" : "إضافة الفرع"}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
