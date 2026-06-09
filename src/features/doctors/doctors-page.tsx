import { AppSelect } from "@/components/app-select";
import { ConfirmModal } from "@/components/confirm-modal";
import { PageHeader } from "@/components/page-header";
import { Paginator } from "@/components/paginator";
import { useDebounce } from "@/hooks/use-debounce";
import { useGovernorates } from "@/hooks/use-governorates";
import type { CreateDoctorDto, DoctorDto } from "@/types";
import { BusinessType } from "@/types";
import {
  Button,
  Chip,
  SearchField,
  Skeleton,
  Table,
  toast,
} from "@heroui/react";
import { Pencil, Stethoscope, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { DoctorDetailsDrawer } from "./doctor-details-drawer";
import { DoctorFormModal } from "./doctor-form-modal";
import {
  useCreateDoctor,
  useDeleteDoctor,
  useDoctors,
  useUpdateDoctor,
} from "./use-doctors";

export function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [governorateId, setGovernorateId] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DoctorDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DoctorDto | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<DoctorDto | null>(null);

  const PAGE_SIZE = 10;

  const { data, isLoading, isError } = useDoctors({
    page,
    pageSize: PAGE_SIZE,
    name: debouncedSearch || undefined,
    governorateId: governorateId || undefined,
  });

  const { data: governorates = [] } = useGovernorates(BusinessType.Doctor);

  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();
  const deleteMutation = useDeleteDoctor();

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 1;

  const handleCreate = (dto: CreateDoctorDto) => {
    createMutation.mutate(dto, {
      onSuccess: () => {
        setAddOpen(false);
        toast.success("تم إضافة الطبيب بنجاح");
      },
      onError: () => toast.danger("حدث خطأ، تأكد من البيانات"),
    });
  };

  const handleUpdate = (dto: CreateDoctorDto) => {
    if (!editTarget) return;
    updateMutation.mutate(
      { id: editTarget.id, dto },
      {
        onSuccess: () => {
          setEditTarget(null);
          toast.success("تم تعديل الطبيب بنجاح");
        },
        onError: () => toast.danger("حدث خطأ"),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success("تم حذف الطبيب بنجاح");
      },
      onError: () => toast.danger("حدث خطأ أثناء الحذف"),
    });
  };

  return (
    <div dir="rtl">
      <PageHeader
        title="الأطباء"
        subtitle={data ? `${data.totalCount} طبيب مسجل` : "جاري التحميل..."}
        action={
          <Button variant="primary" onPress={() => setAddOpen(true)}>
            إضافة طبيب
          </Button>
        }
      />

      {/* ── Filters ── */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <SearchField
          value={searchInput}
          onChange={setSearchInput}
          className="w-56"
          aria-label="البحث بالاسم"
        >
          <SearchField.Group dir="rtl">
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="البحث بالاسم..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <AppSelect
          options={governorates.map((g) => ({ id: g.id, label: g.name }))}
          value={governorateId}
          onChange={(val) => {
            setGovernorateId(val === governorateId ? "" : val);
            setPage(1);
          }}
          placeholder="فلترة بالمحافظة"
          className="w-48"
        />

        {(debouncedSearch || governorateId) && (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => {
              setSearchInput("");
              setGovernorateId("");
              setPage(1);
            }}
          >
            مسح الفلاتر
          </Button>
        )}
      </div>

      {/* ── Table ── */}
      <Table variant="primary">
        <Table.ScrollContainer>
          <Table.Content aria-label="قائمة الأطباء" onRowAction={(key) => {
              const doctor = data?.items.find((d) => d.id === key);
              if (doctor) setDetailsTarget(doctor);
            }}>
            <Table.Header>
              <Table.Column isRowHeader className="text-right">
                الطبيب
              </Table.Column>
              <Table.Column className="hidden md:table-cell text-right">
                التخصص
              </Table.Column>
              <Table.Column className="hidden lg:table-cell text-right">
                المحافظة
              </Table.Column>
              <Table.Column className="hidden lg:table-cell text-right">
                التقييم
              </Table.Column>
              <Table.Column className="hidden md:table-cell text-right">
                سعر الكشف
              </Table.Column>
              <Table.Column className="hidden xl:table-cell text-right">
                أضيف بواسطة
              </Table.Column>
              <Table.Column className="text-right">الإجراءات</Table.Column>
            </Table.Header>

            <Table.Body
              renderEmptyState={() =>
                isError ? (
                  <div className="text-center py-12 text-danger">
                    حدث خطأ في تحميل البيانات
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-12 text-muted">
                    <Stethoscope className="h-8 w-8 text-muted" />
                    <span>لا يوجد أطباء مسجلون</span>
                  </div>
                )
              }
            >
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Table.Row key={i}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                          <Skeleton className="h-4 w-36 rounded" />
                        </div>
                      </Table.Cell>
                      <Table.Cell className="hidden md:table-cell">
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </Table.Cell>
                      <Table.Cell className="hidden lg:table-cell">
                        <Skeleton className="h-4 w-24 rounded" />
                      </Table.Cell>
                      <Table.Cell className="hidden lg:table-cell">
                        <Skeleton className="h-4 w-12 rounded" />
                      </Table.Cell>
                      <Table.Cell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-16 rounded" />
                      </Table.Cell>
                      <Table.Cell className="hidden xl:table-cell">
                        <Skeleton className="h-4 w-16 rounded" />
                      </Table.Cell>
                      <Table.Cell>
                        <Skeleton className="h-8 w-20 rounded" />
                      </Table.Cell>
                    </Table.Row>
                  ))
                : data?.items.map((doctor) => (
                    <Table.Row
                      key={doctor.id}
                      id={doctor.id}
                      className="cursor-pointer"
                    >
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          {doctor.profileImageUrl ? (
                            <img
                              src={doctor.profileImageUrl}
                              alt={doctor.name}
                              className="h-9 w-9 shrink-0 rounded-full object-cover border border-divider"
                            />
                          ) : (
                            <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                              <UserRound className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <span className="font-medium text-foreground">
                            {doctor.name}
                          </span>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="hidden md:table-cell">
                        {doctor.specialization ? (
                          <Chip size="sm" variant="soft" color="accent">
                            {doctor.specialization}
                          </Chip>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </Table.Cell>

                      <Table.Cell className="hidden lg:table-cell text-muted text-sm">
                        {doctor.governorate || "—"}
                      </Table.Cell>

                      <Table.Cell className="hidden lg:table-cell">
                        <span className="flex items-center gap-1 text-warning text-sm">
                          ★ {doctor.averageRating.toFixed(1)}
                        </span>
                      </Table.Cell>

                      <Table.Cell className="hidden md:table-cell">
                        {doctor.visitPrice != null ? (
                          <span className="font-medium text-success text-sm">
                            {doctor.visitPrice} ج.م
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </Table.Cell>

                      <Table.Cell className="hidden xl:table-cell text-muted text-xs">
                        {doctor.createdBy || "—"}
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            isIconOnly
                            onPress={() => setEditTarget(doctor)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger-soft"
                            isIconOnly
                            onPress={() => setDeleteTarget(doctor)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      {/* ── Pagination ── */}
      {data && totalPages > 1 && (
        <div className="py-4">
          <Paginator page={page} total={totalPages} onChange={setPage} />
        </div>
      )}

      {/* ── Modals & Drawers ── */}
      <DoctorDetailsDrawer
        doctor={detailsTarget}
        isOpen={!!detailsTarget}
        onClose={() => setDetailsTarget(null)}
        onEdit={(d) => setEditTarget(d)}
        onDelete={(d) => setDeleteTarget(d)}
      />

      <DoctorFormModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
      <DoctorFormModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
        initial={editTarget}
      />
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`هل أنت متأكد من حذف الطبيب "${deleteTarget?.name}"؟`}
      />
    </div>
  );
}
