"use client";

import Link from "next/link";

import {
  Eye,
  EyeOff,
  User,
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
  setStorage,
  getStorage,
  STORAGE_KEYS,
} from "@/lib/storage";

import {
  generateId,
} from "@/lib/utils";

import type { User as UserType } from "@/types/user";

/* =========================================================
   SIGNUP SCHEMA
========================================================= */

const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Name must be at least 2 characters"
      ),

    email: z
      .string()
      .trim()
      .email(
        "Enter a valid email address"
      ),

    phone: z
      .string()
      .regex(
        /^[6-9]\d{9}$/,
        "Enter a valid 10-digit Indian mobile number"
      ),

    role: z.enum([
      "USER",
      "ADMIN",
    ]),

    password: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters"
      ),

    confirmPassword: z
      .string()
      .min(
        8,
        "Please confirm your password"
      ),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      message:
        "Passwords do not match",
      path: [
        "confirmPassword",
      ],
    }
  );

type SignupFormValues =
  z.infer<typeof signupSchema>;

/* =========================================================
   COMPONENT
========================================================= */

export default function SignupForm() {
  const router = useRouter();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<SignupFormValues>({
    resolver:
      zodResolver(
        signupSchema
      ),

    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "USER",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedRole =
    watch("role");

  /* =========================================================
     SUBMIT
  ========================================================= */

  function onSubmit(
    values: SignupFormValues
  ) {
    setSubmitError("");

    try {
      /*
       * Check existing accounts.
       */
      const storedUsers =
        getStorage<UserType[]>(
          STORAGE_KEYS.USERS,
          []
        );

      const legacyUser =
        getStorage<UserType | null>(
          STORAGE_KEYS.USER,
          null
        );

      const allUsers = [...storedUsers];
      if (legacyUser && !allUsers.some((u) => u.id === legacyUser.id)) {
        allUsers.push(legacyUser);
      }

      if (
        allUsers.some(
          (u) =>
            u.email.toLowerCase() ===
            values.email.trim().toLowerCase()
        )
      ) {
        setSubmitError(
          "An account with this email already exists."
        );

        return;
      }

      /*
       * Create account using
       * selected role.
       */
      const user: UserType = {
        id: generateId(
          values.role === "ADMIN"
            ? "admin"
            : "user"
        ),

        name: values.name.trim(),

        email:
          values.email.trim(),

        phone:
          values.phone.trim(),

        password:
          values.password,

        role:
          values.role,
      };

      /*
       * Save user locally in USERS array and single USER.
       */
      setStorage(
        STORAGE_KEYS.USERS,
        [...allUsers, user]
      );
      setStorage(
        STORAGE_KEYS.USER,
        user
      );

      /*
       * Go to login.
       */
      router.push(
        "/login?registered=true"
      );
    } catch (error) {
      console.error(
        "Signup failed:",
        error
      );

      setSubmitError(
        "Unable to create account. Please try again."
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
          NAME
      ===================================================== */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Full Name
        </label>

        <input
          {...register("name")}
          placeholder="Enter your full name"
          autoComplete="name"
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
            errors.name
              ? "border-red-400"
              : "border-slate-200"
          }`}
        />

        {errors.name && (
          <p className="mt-1.5 text-xs text-red-500">
            {
              errors.name
                .message
            }
          </p>
        )}
      </div>

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
          PHONE
      ===================================================== */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Mobile Number
        </label>

        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          {...register("phone")}
          placeholder="9876543210"
          autoComplete="tel"
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
            errors.phone
              ? "border-red-400"
              : "border-slate-200"
          }`}
        />

        {errors.phone && (
          <p className="mt-1.5 text-xs text-red-500">
            {
              errors.phone
                .message
            }
          </p>
        )}
      </div>

      {/* =====================================================
          ROLE
      ===================================================== */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Account Type
        </label>

        <div className="grid grid-cols-2 gap-3">
          {/* USER */}

          <label
            className={`relative cursor-pointer rounded-xl border p-4 transition ${
              selectedRole ===
              "USER"
                ? "border-red-500 bg-red-50 ring-2 ring-red-100"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              value="USER"
              {...register("role")}
              className="sr-only"
            />

            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  selectedRole ===
                  "USER"
                    ? "bg-red-100 text-red-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <User
                  size={20}
                />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  User
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Book and manage trains
                </p>
              </div>
            </div>

            {selectedRole ===
              "USER" && (
              <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-600" />
            )}
          </label>

          {/* ADMIN */}

          <label
            className={`relative cursor-pointer rounded-xl border p-4 transition ${
              selectedRole ===
              "ADMIN"
                ? "border-red-500 bg-red-50 ring-2 ring-red-100"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              value="ADMIN"
              {...register("role")}
              className="sr-only"
            />

            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  selectedRole ===
                  "ADMIN"
                    ? "bg-red-100 text-red-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <ShieldCheck
                  size={20}
                />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Admin
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Manage train routes
                </p>
              </div>
            </div>

            {selectedRole ===
              "ADMIN" && (
              <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-600" />
            )}
          </label>
        </div>

        {errors.role && (
          <p className="mt-1.5 text-xs text-red-500">
            {
              errors.role
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
            {...register(
              "password"
            )}
            placeholder="Create a password"
            autoComplete="new-password"
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
          CONFIRM PASSWORD
      ===================================================== */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Confirm Password
        </label>

        <div className="relative">
          <input
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            {...register(
              "confirmPassword"
            )}
            placeholder="Confirm your password"
            autoComplete="new-password"
            className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
              errors.confirmPassword
                ? "border-red-400"
                : "border-slate-200"
            }`}
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                (value) =>
                  !value
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            {showConfirmPassword ? (
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

        {errors.confirmPassword && (
          <p className="mt-1.5 text-xs text-red-500">
            {
              errors
                .confirmPassword
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
          SUBMIT
      ===================================================== */}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? "Creating account..."
          : "Create Account"}
      </button>

      {/* =====================================================
          LOGIN
      ===================================================== */}

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}

        <Link
          href="/login"
          className="font-semibold text-red-600 transition hover:text-red-700"
        >
          Login
        </Link>
      </p>
    </form>
  );
}