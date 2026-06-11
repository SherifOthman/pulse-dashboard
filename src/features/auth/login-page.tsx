import { useAuthStore } from "@/auth-store";
import { Button, Input, Label, TextField, toast } from "@heroui/react";
import { AxiosError } from "axios";
import { HeartPulse } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { login } from "./auth-api";

type LoginForm = {
  email: string;
  password: string;
};

export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  });
  const setSession = useAuthStore((s) => s.setSession);

  const onSubmit = async (data: LoginForm) => {
    try {
      const tokens = await login(data.email, data.password);
      setSession(tokens);
      navigate("/", { replace: true });
    } catch (err) {
      const axiosErr = err instanceof AxiosError ? err : null;
      const message =
        axiosErr?.response?.data?.message || axiosErr?.response?.data?.title;
      toast.danger(message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  };

  if (isAuthenticated) return null;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-linear-to from-primary/10 via-background to-primary/5 p-4"
      dir="rtl"
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-primary-foreground shadow-lg">
            <HeartPulse className="h-8 w-8" />
          </div>
          <h1 className="text-foreground text-2xl font-bold">نبض</h1>
          <p className="text-muted mt-1 text-sm">لوحة تحكم المشرف</p>
        </div>

        <div className="bg-surface border-divider rounded-2xl border p-6 shadow-xl">
          <h2 className="text-foreground mb-5 text-lg font-bold text-center">
            تسجيل الدخول
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <TextField>
              <Label className="text-foreground mb-1.5 block text-sm font-medium">
                البريد الإلكتروني
              </Label>
              <Input
                type="email"
                placeholder="admin@pulse.com"
                autoComplete="email"
                className="w-full"
                {...control.register("email", { required: true })}
              />
            </TextField>

            <TextField>
              <Label className="text-foreground mb-1.5 block text-sm font-medium">
                كلمة المرور
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full"
                {...control.register("password", { required: true })}
              />
            </TextField>

            <Button
              type="submit"
              variant="primary"
              isPending={isSubmitting}
              className="mt-1 w-full"
              size="lg"
            >
              {isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
