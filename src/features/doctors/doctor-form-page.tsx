import { Breadcrumbs, Button, Separator, toast } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Save } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { DoctorFormFields } from "./components/doctor-form-fields";
import {
  doctorFormDefaults,
  doctorFormSchema,
  type DoctorFormValues,
} from "./components/doctor-form-schema";
import { ServicesField } from "./components/services-field";
import {
  formToWorkingDays,
  mapWorkingDaysToForm,
} from "./components/working-days-field";
import {
  useCreateDoctor,
  useDoctorDetails,
  useUpdateDoctor,
} from "./use-doctors";

export function DoctorFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } = useDoctorDetails(
    isEdit ? id : null,
  );
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const methods = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: doctorFormDefaults,
    mode: "all",
  });

  const { handleSubmit, reset, watch, setError, clearErrors } = methods;

  // Populate form when editing
  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        specializationId: existing.specializationId || "",
        governorateId: existing.governorateId || "",
        cityId: existing.cityId || "",
        description: existing.description || "",
        address: existing.address || "",
        gender: existing.gender?.toString() || "",
        visitPrice: existing.visitPrice != null ? existing.visitPrice.toString() : "",
        profileImageUrl: existing.profileImageUrl || "",
        coverImageUrl: existing.coverImageUrl || "",
        latitude: existing.latitude ?? null,
        longitude: existing.longitude ?? null,
        workingDays: mapWorkingDaysToForm(existing.workingDays),
        phoneNumbers: existing.phoneNumbers.map((p) => ({
          number: p.number,
          type: p.type || "",
        })),
      });
    }
  }, [existing, reset]);

  const onSubmit = (data: DoctorFormValues) => {
    clearErrors();
    const dto = {
      name: data.name.trim(),
      specializationId: data.specializationId || undefined,
      cityId: data.cityId || undefined,
      description: data.description?.trim() || undefined,
      address: data.address?.trim() || undefined,
      gender:
        data.gender !== "" && data.gender !== undefined
          ? parseInt(data.gender)
          : undefined,
      visitPrice: data.visitPrice ? parseFloat(data.visitPrice) : null,
      clearVisitPrice: !data.visitPrice,
      profileImageUrl: data.profileImageUrl || undefined,
      coverImageUrl: data.coverImageUrl || undefined,
      latitude: data.latitude ?? undefined,
      longitude: data.longitude ?? undefined,
      workingDays: formToWorkingDays(data.workingDays),
      phoneNumbers:
        data.phoneNumbers.filter((p) => p.number.trim()).length > 0
          ? data.phoneNumbers
              .filter((p) => p.number.trim())
              .map((p) => ({
                number: p.number.trim(),
                type: p.type?.trim() || null,
              }))
          : undefined,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: id!, dto },
        {
          onSuccess: () => {
            toast.success("تم الحفظ بنجاح");
            navigate(`/doctors/${id}`);
          },
          onError: (err: any) => {
            if (err?.response?.data?.errors) {
              Object.entries(err.response.data.errors).forEach(
                ([field, messages]) => {
                  // @ts-ignore
                  setError(field as any, {
                    message: (messages as string[])[0],
                  });
                },
              );
            }
            const msg =
              err?.response?.data?.error || "حدث خطأ، تحقق من البيانات";
            toast.danger(msg);
          },
        },
      );
    } else {
      createMutation.mutate(dto, {
        onSuccess: (result) => {
          toast.success("تمت الإضافة بنجاح");
          navigate(`/doctors/${result.id}`);
        },
        onError: (err: any) => {
          if (err?.response?.data?.errors) {
            Object.entries(err.response.data.errors).forEach(
              ([field, messages]) => {
                // @ts-ignore
                setError(field as any, { message: (messages as string[])[0] });
              },
            );
          }
          const msg = err?.response?.data?.error || "حدث خطأ، تحقق من البيانات";
          toast.danger(msg);
        },
      });
    }
  };

  const nameValue = watch("name");

  return (
    <div dir="rtl" className="max-w-3xl mx-auto pb-8 doctor-form-scroll-root">
      {/* ── Breadcrumbs ── */}
      <Breadcrumbs className="mb-4" onAction={(key) => navigate(String(key))}>
        <Breadcrumbs.Item id="/doctors">الأطباء</Breadcrumbs.Item>
        {isEdit && existing ? (
          <Breadcrumbs.Item id={`/doctors/${id}`}>
            {existing.name}
          </Breadcrumbs.Item>
        ) : null}
        <Breadcrumbs.Item>{isEdit ? "تعديل" : "إضافة طبيب"}</Breadcrumbs.Item>
      </Breadcrumbs>

      {/* ── Page title ── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">
          {isEdit
            ? loadingExisting
              ? "..."
              : `تعديل: ${existing?.name}`
            : "إضافة طبيب جديد"}
        </h1>
      </div>

      <Separator className="mb-6" />

      {/* ── Form ── */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit, (errors) => {
            console.error('Form validation failed:', errors)
            toast.danger('تحقق من البيانات المدخلة')
          })} noValidate>
          <DoctorFormFields />

          {/* ── Services (edit mode only — needs existing doctor ID) ── */}
          {isEdit && id && (
            <div className="mt-6">
              <Separator className="mb-6" />
              <ServicesField doctorId={id} />
            </div>
          )}

          {/* ── Branches shortcut (edit only) ── */}
          {isEdit && (
            <div className="mt-4">
              <Button
                variant="ghost"
                onPress={() => navigate(`/doctors/${id}/branches`)}
                className="w-full justify-start gap-2"
                type="button"
              >
                <Building2 className="h-4 w-4" />
                إدارة الفروع
              </Button>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex items-center gap-3 mt-6 mb-2">
            <Button
              type="submit"
              variant="primary"
              isPending={isPending}
              isDisabled={!nameValue?.trim()}
            >
              <Save className="h-4 w-4" />
              {isEdit ? "حفظ التعديلات" : "إضافة الطبيب"}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onPress={() => navigate(isEdit ? `/doctors/${id}` : "/doctors")}
              isDisabled={isPending}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
