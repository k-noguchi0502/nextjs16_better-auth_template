import { AuthCard } from "@/components/auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <AuthCard className={className} {...props} />;
}
