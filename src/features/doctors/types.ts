// ── Shared sub-types ──────────────────────────────────────────────────────────

export type WorkingDayDto = {
  day: number; // 0=Sunday … 6=Saturday
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
};

export type PhoneNumberDto = {
  number: string;
  type: string | null;
};

export type ServiceDto = {
  name: string;
};

export type BranchDto = {
  id: string;
  parentBusinessId: string;
  name: string;
  address: string | null;
  city: string | null;
  governorate: string | null;
  visitPrice: number | null;
  latitude: number | null;
  longitude: number | null;
  isOpen: boolean;
  phoneNumbers: PhoneNumberDto[];
  workingDays: WorkingDayDto[];
};

export type TestimonialDto = {
  id: string;
  userName: string | null;
  userImageUrl: string | null;
  rating: number;
  text: string;
  createdAt: string;
};

// ── Doctor list (GET /dashboard/doctors) ─────────────────────────────────────

export type DoctorListItem = {
  id: string;
  name: string;
  profileImageUrl: string | null;
  specialization: string;
  governorate: string;
  averageRating: number;
  gender: number; // 0=Male, 1=Female
  createdBy: string | null;
  visitPrice: number | null;
};

// ── Doctor details (GET /dashboard/doctors/:id) ───────────────────────────────

export type DoctorDetailsDto = {
  id: string;
  name: string;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  description: string | null;
  address: string | null;
  governorate: string;
  governorateId: string;
  city: string;
  cityId: string;
  latitude: number | null;
  longitude: number | null;
  averageRating: number;
  totalRatings: number;
  gender: number; // 0=Male, 1=Female
  workingDays: WorkingDayDto[];
  phoneNumbers: PhoneNumberDto[];
  branches: BranchDto[];
  testimonials: TestimonialDto[];
  services: ServiceDto[];
  specializationIds: string[];
  specializations: string[];
  visitPrice: number | null;
};

// ── Create / Update doctor ────────────────────────────────────────────────────

export type CreateDoctorDto = {
  name: string;
  specializationIds?: string[];
  cityId?: string;
  description?: string;
  address?: string;
  gender?: number;
  visitPrice?: number | null;
  clearVisitPrice?: boolean;
  profileImageUrl?: string;
  coverImageUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  workingDays?: WorkingDayDto[];
  phoneNumbers?: PhoneNumberDto[];
};

// ── Branch list (GET /dashboard/doctors/:id/branches) ────────────────────────

export type BranchListItem = {
  id: string;
  name: string;
  profileImageUrl: string | null;
  governorate: string | null;
  city: string | null;
  visitPrice: number | null;
  isOpen: boolean;
};

// ── Branch details (GET /dashboard/doctors/:doctorId/branches/:id) ────────────

export type BranchDetails = {
  id: string;
  name: string;
  address: string | null;
  governorate: string;
  governorateId: string;
  city: string;
  cityId: string;
  visitPrice: number | null;
  latitude: number | null;
  longitude: number | null;
  workingDays: WorkingDayDto[];
  phoneNumbers: PhoneNumberDto[];
};

// ── Create / Update branch ────────────────────────────────────────────────────

export type CreateBranchDto = {
  name: string;
  cityId?: string;
  address?: string;
  visitPrice?: number;
  latitude?: number | null;
  longitude?: number | null;
  workingDays?: WorkingDayDto[];
  phoneNumbers?: PhoneNumberDto[];
};
