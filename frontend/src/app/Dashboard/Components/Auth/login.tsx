"use client";

import React, { useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bounce, toast } from "react-toastify";
import { UserContext } from "@/app/Dashboard/Context/ManageUserContext";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { AuthChildProps } from "./types";
import styles from "./SignIn.module.scss";

type Role = "User" | "Admin" | "SuperAdmin";

interface SignInProps {
  setMode: (mode: string) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginResponse {
  status: number;
  data?: any;
  msg?: string;
  success?: boolean;
}

export const SignIn: React.FC<AuthChildProps> = ({ setMode }) => {
  const [formData, setFormData] = useState({ role: "User" as Role, email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { Userdispatch, UserSignIn } = useContext(UserContext) as any;

  const isValidEmail = EMAIL_REGEX.test(formData.email);
  const isFormValid = formData.email.trim() && formData.password.trim() && isValidEmail;

  const handleChange = useCallback(
    (field: keyof typeof formData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value as any }));
      },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isFormValid) {
        toast.error("Please fill valid email and password", {
          position: "top-center",
          transition: Bounce,
        });
        return;
      }

      try {
        setLoading(true);

        const result: LoginResponse | null = await UserSignIn({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });

        if (!result) {
          toast.error("Unexpected error during login", { position: "top-center", transition: Bounce });
          return;
        }

        const { status, data } = result;

        switch (status) {
          case 200: {
            toast.success(data?.msg || "Welcome", {
              position: "top-center",
              autoClose: 3000,
              transition: Bounce,
            });

            Userdispatch({ type: "SIGN_IN", payload: data });
            router.push("/Dashboard/pages/Home");
            break;
          }

          case 400:
            toast.error(data?.msg || "Email and password are required", {
              position: "top-center",
              transition: Bounce,
            });
            break;

          case 401:
            toast.error(data?.msg || "Wrong password", {
              position: "top-center",
              transition: Bounce,
            });
            break;

          case 403:
            toast.error(data?.msg || "Account is deactivated", {
              position: "top-center",
              transition: Bounce,
            });
            break;

          case 404:
            toast.error(data?.msg || "User does not exist", {
              position: "top-center",
              transition: Bounce,
            });
            break;

          case 500:
          default:
            toast.error(data?.msg || "Server error during login", {
              position: "top-center",
              transition: Bounce,
            });
            break;
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Network error, please try again", {
          position: "top-center",
          transition: Bounce,
        });
      } finally {
        setLoading(false);
      }
    },
    [formData, isFormValid, UserSignIn, Userdispatch, router]
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Lock className={styles.lockIcon} />
          </div>
          <h2 className={styles.title}>Login</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.selectWrapper}>
            <select
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as Role }))}
              className={styles.select}
              disabled={loading}
            >
              <option value="User">👤 User</option>
              <option value="Admin">🛡️ Admin</option>
              <option value="SuperAdmin">👑 Super Admin</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <Mail className={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange("email")}
              className={`${styles.input} ${!isValidEmail && formData.email ? styles.inputError : ""}`}
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <Lock className={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange("password")}
              className={styles.input}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={styles.passwordToggle}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`${styles.submitBtn} ${!isFormValid || loading ? styles.submitDisabled : ""}`}
          >
            {loading ? (
              <>
                <Loader2 className={styles.spinner} />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className={styles.arrow} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <button
            onClick={() => setMode("forgot")}
            className={styles.link}
            disabled={loading}
          >
            Forgot Password?
          </button>
          <p className={styles.signupPrompt}>
            New here?{" "}
            <button
              onClick={() => setMode("signup")}
              className={styles.link}
              disabled={loading}
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};