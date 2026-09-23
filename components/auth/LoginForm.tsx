"use client";

import Link from "next/link";

import {
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";

import {
  useForm,
} from "react-hook-form";

import { z } from "zod";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  useRouter,
} from "next/navigation";

import {
  getStorage,
  setStorage,
  STORAGE_KEYS,
} from "@/lib/storage";

import {
  mockAdmin,
  mockUser,
} from "@/data/users";

import type {
  AuthUser,
  User,
} from "@/types/user";

/* =========================================================
   LOGIN SCHEMA
========================================================= */

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email(
      "Enter a valid email address"
    ),

  password: z
    .string()
    .min(
      1,
      "Please enter your password"
    ),
});

type LoginFormValues =
  z.infer<typeof loginSchema>;

/* =========================================================
   LOGIN COMPONENT
========================================================= */

export default function LoginForm() {
  const router = useRouter();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver:
      zodResolver(
        loginSchema
      ),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  /* =========================================================
     LOGIN
  ========================================================= */

  function onSubmit(
    values: LoginFormValues
  ) {
    setSubmitError("");

    try {
      /*
       * Get accounts created
       * through Signup.
       */
      const storedUsers =
        getStorage<User[]>(
          STORAGE_KEYS.USERS,
          []
        );

      const legacyUser =
        getStorage<User | null>(
          STORAGE_KEYS.USER,
          null
        );

      /*
       * Demo accounts.
       */
      const users: User[] = [
        mockUser,
        mockAdmin,
      ];

      /*
       * Add signed-up accounts.
       */
      for (const item of storedUsers) {
        if (!users.some((u) => u.id === item.id || u.email.toLowerCase() === item.email.toLowerCase())) {
          users.push({
            ...item,
            role: item.role ?? "USER",
          });
        }
      }

      if (legacyUser && !users.some((u) => u.id === legacyUser.id || u.email.toLowerCase() === legacyUser.email.toLowerCase())) {
        users.push({
          ...legacyUser,
          role: legacyUser.role ?? "USER",
        });
      }

      /*
       * Find account by email.
       */
      const user =
        users.find(
          (item) =>
            item.email
              .trim()
              .toLowerCase() ===
            values.email
              .trim()
              .toLowerCase()
        );

      if (!user) {
        setSubmitError(
          "Account not found. Please check your email or create an account."
        );

        return;
      }

      /*
       * Check password.
       */
      if (
        user.password !==
        values.password
      ) {
        setSubmitError(
          "Invalid email or password."
        );

        return;
      }

      /*
       * Make sure role always has
       * a valid value.
       */
      const userRole =
        user.role === "ADMIN"
          ? "ADMIN"
          : "USER";

      /*
       * Create authenticated
       * session.
       */
      const authUser: AuthUser = {
        id: user.id,

        name: user.name,

        email: user.email,

        phone: user.phone,

        role: userRole,

        isLoggedIn: true,
      };

      /*
       * Save authentication state.
       */
      setStorage(
        STORAGE_KEYS.AUTH,
        authUser
      );

      /*
       * Notify Navbar and other
       * components that authentication
       * changed.
       */
      window.dispatchEvent(
        new Event(
          "railbook-auth-change"
        )
      );

      /*
       * Role-based redirect.
       *
       * ADMIN → /admin
       * USER  → /
       */
      if (
        userRole === "ADMIN"
      ) {
        router.push(
          "/admin"
        );
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      setSubmitError(
        "Unable to login. Please try again."
      );
    }
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
      className="space-y-5"
    >
      {/* =====================================================
          EMAIL
      ===================================================== */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Email Address
        </label>

        <input
          type="email"
          {...register("email")}
          placeholder="you@example.com"
          autoComplete="email"
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
            errors.email
              ? "border-red-400"
              : "border-slate-200"
          }`}
        />

        {errors.email && (
          <p className="mt-1.5 text-xs text-red-500">
            {
              errors.email
                .message
            }
          </p>
        )}
      </div>

      {/* =====================================================
          PASSWORD
      ===================================================== */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Password
        </label>

        <div className="relative">
          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            {...register("password")}
            placeholder="Enter your password"
            autoComplete="current-password"
            className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
              errors.password
                ? "border-red-400"
                : "border-slate-200"
            }`}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (value) =>
                  !value
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff
                size={18}
              />
            ) : (
              <Eye
                size={18}
              />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="mt-1.5 text-xs text-red-500">
            {
              errors.password
                .message
            }
          </p>
        )}
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
          {submitError}
        </div>
      )}

      {/* =====================================================
          LOGIN BUTTON
      ===================================================== */}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? "Signing in..."
          : "Login"}
      </button>

      {/* =====================================================
          SIGNUP
      ===================================================== */}

      <p className="text-center text-sm text-slate-500">
        Don't have an account?{" "}

        <Link
          href="/signup"
          className="font-semibold text-red-600 transition hover:text-red-700"
        >
          Create account
        </Link>
      </p>

      {/* =====================================================
          DEMO ACCOUNTS
      ===================================================== */}

      <div className="space-y-3">

        {/* USER */}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Demo User
          </p>

          <div className="mt-2 space-y-1 text-xs">
            <p className="text-slate-500">
              Email:{" "}
              <span className="font-medium text-slate-700">
                {mockUser.email}
              </span>
            </p>

            <p className="text-slate-500">
              Password:{" "}
              <span className="font-medium text-slate-700">
                {mockUser.password}
              </span>
            </p>
          </div>
        </div>

        {/* ADMIN */}

        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={16}
              className="text-red-600"
            />

            <p className="text-xs font-bold uppercase tracking-wide text-red-600">
              Demo Admin
            </p>
          </div>

          <div className="mt-2 space-y-1 text-xs">
            <p className="text-slate-500">
              Email:{" "}
              <span className="font-medium text-slate-700">
                {mockAdmin.email}
              </span>
            </p>

            <p className="text-slate-500">
              Password:{" "}
              <span className="font-medium text-slate-700">
                {mockAdmin.password}
              </span>
            </p>
          </div>
        </div>

      </div>
    </form>
  );
}