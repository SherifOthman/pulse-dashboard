import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input } from '@heroui/react'
import { Modal, ModalContainer, ModalDialog, ModalCloseTrigger, ModalHeader, ModalHeading, ModalBody, ModalFooter } from '@heroui/react'
import { AppSelect } from '@/components/app-select'
import type { DashboardUser, CreateDashboardUserDto } from './types'

function createUserFormSchema(isCreate: boolean) {
  return z.object({
    email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('البريد الإلكتروني غير صحيح'),
    password: isCreate
      ? z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      : z.string().optional(),
    fullName: z.string().min(1, 'الاسم مطلوب'),
    role: z.string().min(1, 'الصلاحية مطلوبة'),
  })
}

type UserFormValues = z.infer<ReturnType<typeof createUserFormSchema>>

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (dto: CreateDashboardUserDto) => void
  isLoading?: boolean
  initial?: DashboardUser | null
}

export function UserFormModal({ isOpen, onClose, onSubmit, isLoading, initial }: Props) {
  const schema = createUserFormSchema(!initial)
  const { control, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', fullName: '', role: '' },
  })

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        reset({
          email: initial.email || '',
          password: '',
          fullName: initial.fullName || '',
          role: initial.role || 'Manager',
        })
      } else {
        reset({ email: '', password: '', fullName: '', role: '' })
      }
    }
  }, [initial, isOpen, reset])

  const onFormSubmit = (data: UserFormValues) => {
    onSubmit({
      email: data.email.trim(),
      password: data.password || undefined,
      fullName: data.fullName.trim(),
      role: data.role || undefined,
    })
  }

  const roleOptions = [
    { id: 'Admin', label: 'Admin' },
    { id: 'Manager', label: 'Manager' },
  ]

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <ModalContainer size="lg">
        <ModalDialog>
          <ModalCloseTrigger />
          <ModalHeader>
            <ModalHeading>{initial ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</ModalHeading>
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">الاسم الكامل *</label>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="الاسم الكامل" className="w-full" />
                )}
              />
              {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">البريد الإلكتروني *</label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="email" placeholder="example@pulse.com" className="w-full" />
                )}
              />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {initial ? 'كلمة المرور (اتركه فارغاً إذا لم ترد التغيير)' : 'كلمة المرور *'}
              </label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="password" placeholder="••••••••" className="w-full" />
                )}
              />
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">الصلاحية</label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <AppSelect
                    options={roleOptions}
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="اختر الصلاحية"
                    className="w-full"
                  />
                )}
              />
              {errors.role && <p className="text-xs text-danger mt-1">{errors.role.message}</p>}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onClose} isDisabled={isLoading}>إلغاء</Button>
            <Button variant="primary" onPress={() => handleSubmit(onFormSubmit)()} isPending={isLoading}>
              {initial ? 'حفظ التعديلات' : 'إضافة'}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </Modal.Backdrop>
  )
}
