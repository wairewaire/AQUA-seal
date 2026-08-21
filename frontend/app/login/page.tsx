'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Users,
  Fish,
  ShoppingBag,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Brand } from '@/components/shared/brand';
import { signIn, LOGIN_ROLES, ApiRequestError } from '@/lib/api/auth';
import { roleLabel } from '@/lib/format';
import type { UserRole } from '@/types';

type FormState = 'idle' | 'loading' | 'error' | 'success';

const ROLE_ICONS: Record<UserRole, typeof Users> = {
  bmu_officer: Users,
  fisher: Fish,
  buyer: ShoppingBag,
  county_officer: ShieldAlert,
  admin: ShieldAlert,
};

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSignIn(id: string, pw: string) {
    setFormState('loading');
    setErrorMessage('');
    try {
      await signIn({ identifier: id, password: pw });
      setFormState('success');
      // Brief success flash before redirecting into the app.
      setTimeout(() => router.push('/verify'), 500);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
      setFormState('error');
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending || formState === 'loading' || formState === 'success') return;
    startTransition(() => handleSignIn(identifier, password));
  }

  function fillDemo(identifier: string) {
    setIdentifier(identifier);
    setPassword('demo1234');
    setFormState('idle');
    setErrorMessage('');
  }

  const isLoading = formState === 'loading';
  const isSuccess = formState === 'success';

  return (
    <div className="flex min-h-dvh flex-col bg-background lg:flex-row">
      {/* Left panel — branding / context (hidden on small screens) */}
      <div className="relative hidden flex-col justify-between bg-lake-gradient p-10 text-white lg:flex lg:w-2/5">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight">
              Aqua-Seal
            </span>
          </div>
        </div>
        <div className="relative z-10 max-w-sm space-y-4">
          <h2 className="font-display text-3xl font-bold leading-tight">
            Fish traceability for Lake Victoria.
          </h2>
          <p className="text-white/80">
            Verifying every catch from net to market — built for small-scale
            fishers and Beach Management Units across Kenya's shoreline.
          </p>
          <ul className="space-y-2 text-sm text-white/75">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" aria-hidden="true" />
              Batch verification by ID or QR
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" aria-hidden="true" />
              Freshness grading & cold-chain tracking
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" aria-hidden="true" />
              Marketplace for landed fish
            </li>
          </ul>
        </div>
        <p className="relative z-10 text-xs text-white/50">
          Prototype build · mock data only
        </p>
        {/* Subtle texture overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)',
          }}
        />
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile branding */}
          <div className="flex justify-center lg:hidden">
            <Brand size="md" />
          </div>

          <div className="space-y-1.5 text-center lg:text-left">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Use your email or phone number and password to continue.
            </p>
          </div>

          {/* Form card */}
          <Card>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="font-display text-lg">Welcome back</CardTitle>
              <CardDescription>
                No real credentials needed — any password works in this prototype.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                {/* Identifier */}
                <div className="space-y-1.5">
                  <Label htmlFor="identifier" className="text-sm font-medium">
                    Email or phone
                  </Label>
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="you@example.com or +2547…"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isLoading || isSuccess}
                    required
                    aria-invalid={formState === 'error' && !identifier.trim()}
                    aria-describedby={errorMessage ? 'signin-error' : undefined}
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                      onClick={() => setShowPassword((s) => !s)}
                      disabled={isLoading || isSuccess}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter any password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || isSuccess}
                      required
                      className="pr-10"
                      aria-describedby={errorMessage ? 'signin-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      disabled={isLoading || isSuccess}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {formState === 'error' && errorMessage && (
                  <div
                    id="signin-error"
                    role="alert"
                    className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Success message */}
                {isSuccess && (
                  <div
                    role="status"
                    className="flex items-center gap-2 rounded-md border border-success/30 bg-success/5 p-3 text-sm text-success"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Signed in. Taking you to verification…</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || isSuccess || isPending}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Signing in…
                    </>
                  ) : isSuccess ? (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                      Signed in
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                      Sign in
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo role shortcuts */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Quick demo sign-in
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LOGIN_ROLES.map((r) => {
                const Icon = ROLE_ICONS[r.role];
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => fillDemo(r.identifier)}
                    disabled={isLoading || isSuccess}
                    className="group flex flex-col items-start gap-1 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span className="text-sm font-semibold text-foreground">
                        {r.label}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">{r.description}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {roleLabel('fisher')}, {roleLabel('bmu_officer')}, {roleLabel('buyer')}, and {roleLabel('admin')} accounts are ready to explore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
