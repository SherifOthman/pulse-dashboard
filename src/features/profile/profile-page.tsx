import { useState } from 'react'
import { Button, Input, Card, toast } from '@heroui/react'
import { User, Mail, Shield } from 'lucide-react'
import api from '@/services/api'
import { AxiosError } from 'axios'
import { useMe } from '@/features/auth/use-me'

export function ProfilePage() {
  const { data: me } = useMe()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setLoading] = useState(false)

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return
    if (newPassword !== confirmPassword) {
      toast.danger('كلمة المرور الجديدة وتأكيدها غير متطابقين')
      return
    }
    setLoading(true)
    try {
      await api.post('/users/me/change-password', { currentPassword, newPassword })
      toast.success('تم تغيير كلمة المرور بنجاح')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const axiosErr = err instanceof AxiosError ? err : null
      const message = axiosErr?.response?.data?.message || axiosErr?.response?.data?.title
      toast.danger(message || 'حدث خطأ أثناء تغيير كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">الملف الشخصي</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-foreground">معلومات الحساب</h2>

        <div className="flex items-center gap-3 text-sm">
          <User className="h-5 w-5 text-muted shrink-0" />
          <div className="flex flex-col">
            <span className="text-muted">الاسم</span>
            <span className="font-medium text-foreground">{me?.fullName || '—'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Mail className="h-5 w-5 text-muted shrink-0" />
          <div className="flex flex-col">
            <span className="text-muted">البريد الإلكتروني</span>
            <span className="font-medium text-foreground">{me?.email || '—'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Shield className="h-5 w-5 text-muted shrink-0" />
          <div className="flex flex-col">
            <span className="text-muted">الدور</span>
            <span className="font-medium text-foreground">{me?.role === 'Admin' ? 'مدير النظام' : 'مشرف'}</span>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-foreground">تغيير كلمة المرور</h2>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">كلمة المرور الحالية *</label>
          <Input variant="secondary" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full" />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">كلمة المرور الجديدة *</label>
          <Input variant="secondary" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full" />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">تأكيد كلمة المرور الجديدة *</label>
          <Input variant="secondary" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
            <Button variant="primary" onPress={handleChangePassword} isDisabled={isLoading} isPending={isLoading}>
            تغيير كلمة المرور
          </Button>
        </div>
      </Card>
      </div>
    </div>
  )
}
