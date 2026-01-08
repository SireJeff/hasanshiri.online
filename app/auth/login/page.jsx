import { LoginForm } from './login-form'

export const metadata = {
  title: 'Login',
  description: 'Login to admin dashboard',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Login</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access the admin dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
