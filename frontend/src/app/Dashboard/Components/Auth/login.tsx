"use client";

import React, { useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bounce, toast } from "react-toastify";
import { UserContext } from "@/app/Dashboard/Context/ManageUserContext";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { AuthChildProps } from "./types";

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

            // Save payload in UserContext
            Userdispatch({ type: "SIGN_IN", payload: data });

            // Role-based routing
           router.push("/Dashboard/pages/Home")
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7 text-teal-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
              Login
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
  <select
    value={formData.role}
    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as Role }))}
    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-semibold 
               focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
    disabled={loading}
  >
    <option className="bg-slate-900 text-white" value="USER">👤 User</option>
    <option className="bg-slate-900 text-white" value="ADMIN">🛡️ Admin</option>
    <option className="bg-slate-900 text-white" value="SUPER_ADMIN">👑 Super Admin</option>
  </select>
  {/* <RoleIcon role={formData.role} /> */}
</div>


            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange("email")}
                className={`w-full pl-9 pr-3 py-2.5 bg-white/10 border rounded-xl text-white text-sm 
                           focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all border-white/20 ${
                             !isValidEmail && formData.email ? "border-red-500 ring-red-500/30" : ""
                           }`}
                disabled={loading}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange("password")}
                className="w-full pl-9 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm 
                           focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all hover:bg-white/20"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full flex items-center justify-center py-3 px-4 text-sm font-semibold rounded-xl transition-all shadow-lg ${
                isFormValid && !loading
                  ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 hover:shadow-xl hover:-translate-y-px"
                  : "bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center space-y-2 pt-4 mt-4 border-t border-white/10">
            <button
              onClick={() => setMode("forgot")}
              className="text-xs text-teal-400 hover:text-teal-300"
              disabled={loading}
            >
              Forgot Password?
            </button>
            <p className="text-xs text-gray-400">
              New here?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-teal-400 hover:text-teal-300 font-semibold"
                disabled={loading}
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
