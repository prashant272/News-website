"use client";

import React, {
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { Bounce, toast } from "react-toastify";
import { UserContext } from "@/app/Dashboard/Context/ManageUserContext";
import {
  Users,
  Shield,
  Crown,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Image,
  Loader2,
  Key,
  Check,
} from "lucide-react";
import { AuthChildProps } from "./types";

interface SignUpProps {
  setMode: (mode: string) => void;
}

type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  role: Role;
  profilePicture?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

interface SignUpResponse {
  status: number;
  data?: {
    success?: boolean;
    user?: any;
    msg?: string;
  };
}

// helper to extract message from unknown error
const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    const maybeMessage = (err as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage;
  }
  return "Something went wrong";
};

export const SignUp: React.FC<AuthChildProps> = ({ setMode }) => {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
    role: "USER" as Role,
  });
  const [otpData, setOtpData] = useState<SignUpFormData | null>(null);
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { SENDOTP, VERIFYOTP, UserSignUp } = useContext(UserContext) as any;

  const isValid = useMemo(
    () => ({
      email: EMAIL_REGEX.test(formData.email),
      password: PASSWORD_REGEX.test(formData.password),
    }),
    [formData]
  );

  const isFormValid = formData.name.trim() && isValid.email && isValid.password;
  const isOtpValid = otp.length === 6;

  const handleChange = useCallback(
    (field: keyof SignUpFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value as any }));
      },
    []
  );

  const handleOtpChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
      setOtp(value);
    },
    []
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.size < 2 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (ev: ProgressEvent<FileReader>) =>
          setFormData((prev) => ({
            ...prev,
            profilePicture: ev.target?.result as string,
          }));
        reader.readAsDataURL(file);
        toast.success("Profile picture selected!", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        toast.error("Image must be under 2MB", {
          position: "top-center",
          transition: Bounce,
        });
      }
    },
    []
  );

  const sendOtpToAdmin = useCallback(async () => {
    if (!isFormValid) {
      toast.error("Please fill all fields correctly", {
        position: "top-center",
        transition: Bounce,
      });
      return;
    }

    try {
      setLoading(true);
      const signupData: SignUpFormData = { ...formData };
      setOtpData(signupData);

      const body = { UserEmail: formData.email };
      const response = await SENDOTP(body);

      const responseData = response?.data || response;

      const resolve = new Promise((resolve, reject) => {
        setTimeout(() => {
          const status = responseData?.Status || responseData?.status;

          if (status === "OTP Sent Successfully") {
            setShowOtpInput(true);
            setStep("otp");
            toast.success(
              `✅ OTP sent to ${formData.email}! Check administrator email`,
              {
                position: "top-center",
                autoClose: 5000,
                transition: Bounce,
              }
            );
            resolve(responseData);
          } else {
            reject(new Error(`OTP Status: ${status}`));
          }
        }, 1000);
      });

      await toast.promise(resolve, {
        pending: "📧 Sending approval code to administrator...",
        success: "🎉 OTP sent successfully! Check email.",
        error: {
          render({ data }) {
            const msg = getErrorMessage(data);
            return `❌ Failed: ${msg}`;
          },
        },
      });
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(
          (error as any)?.response?.data?.message ?? error
        ) || "Failed to send OTP to administrator",
        {
          position: "top-center",
          transition: Bounce,
        }
      );
    } finally {
      setLoading(false);
    }
  }, [formData, isFormValid, SENDOTP]);

  const verifyOtpAndSignup = useCallback(async () => {
    if (!otpData || otp.length !== 6) {
      toast.error("Please enter valid 6-digit OTP", {
        position: "top-center",
        transition: Bounce,
      });
      return;
    }

    try {
      setLoading(true);

      const verifyBody = { email: otpData.email, otp };
      const verifyResponse = await VERIFYOTP(verifyBody);

      const verifyData = verifyResponse?.data || verifyResponse;

      const verifyResolve = new Promise((resolve, reject) => {
        setTimeout(() => {
          if (verifyData?.msg === "OTP verified successfully") {
            toast.success("✅ Administrator approved!", {
              position: "top-center",
              autoClose: 2000,
              transition: Bounce,
            });
            resolve(verifyData);
          } else {
            reject(new Error(verifyData?.msg || "Invalid OTP"));
          }
        }, 1000);
      });

      await toast.promise(verifyResolve, {
        pending: "🔍 Verifying administrator approval...",
        success: "✅ Approved! Creating your account...",
        error: {
          render({ data }) {
            const msg = getErrorMessage(data);
            return `❌ ${msg}`;
          },
        },
      });

      const payload = {
        name: otpData.name,
        email: otpData.email,
        password: otpData.password,
        role: otpData.role,
        ProfilePicture: otpData.profilePicture,
      };

      const signupRes: SignUpResponse = await UserSignUp(payload);

      if (signupRes.status === 201) {
        toast.success("🎉 Account created successfully! Welcome aboard!", {
          position: "top-center",
          autoClose: 3000,
          transition: Bounce,
        });
        setTimeout(() => setMode("signin"), 1500);
      } else {
        toast.error(signupRes.data?.msg || "Registration failed", {
          position: "top-center",
          transition: Bounce,
        });
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Registration failed", {
        position: "top-center",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  }, [otpData, otp, VERIFYOTP, UserSignUp, router]);

  useEffect(() => {
    if (step === "otp" && otpInputRef.current && showOtpInput) {
      otpInputRef.current.focus();
    }
  }, [step, showOtpInput]);

  const RoleIcon = ({ role }: { role: Role }) => {
    const icons = { USER: Users, ADMIN: Shield, SUPER_ADMIN: Crown };
    const Icon = icons[role as keyof typeof icons];
    return (
      <Icon
        className={`h-4 w-4 ${
          role === "USER"
            ? "text-blue-400"
            : role === "ADMIN"
            ? "text-orange-400"
            : "text-purple-400"
        }`}
      />
    );
  };

  const goBack = () => {
    setStep("form");
    setOtpData(null);
    setOtp("");
    setShowOtpInput(false);
  };

  const resendOtp = useCallback(async () => {
    if (otpData) {
      setOtp("");
      await sendOtpToAdmin();
    }
  }, [otpData, sendOtpToAdmin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              {step === "form" ? (
                <Users className="w-7 h-7 text-teal-400" />
              ) : (
                <Key className="w-7 h-7 text-teal-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
              {step === "form" ? "Create Account" : "Admin Approval"}
            </h2>
            {step === "otp" && (
              <p className="text-sm text-gray-400 mt-1">
                Enter 6-digit code from administrator email
              </p>
            )}
          </div>

          {step === "form" ? (
            <form className="space-y-3">
              <div className="relative">
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: e.target.value as Role,
                    }))
                  }
                  className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-semibold 
               focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
                  disabled={loading}
                >
                  <option
                    className="bg-slate-900 text-white"
                    value="USER"
                  >
                    👤 User
                  </option>
                  <option
                    className="bg-slate-900 text-white"
                    value="ADMIN"
                  >
                    🛡️ Admin
                  </option>
                  <option
                    className="bg-slate-900 text-white"
                    value="SUPER_ADMIN"
                  >
                    👑 Super Admin
                  </option>
                </select>
                <RoleIcon role={formData.role} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange("name")}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm 
                               focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all"
                    disabled={loading}
                  />
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
                                 !isValid.email && formData.email
                                   ? "border-red-500 ring-red-500/30"
                                   : ""
                               }`}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (8+ chars)"
                  value={formData.password}
                  onChange={handleChange("password")}
                  className={`w-full pl-9 pr-10 py-2.5 bg-white/10 border rounded-xl text-white text-sm 
                               focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all border-white/20 ${
                                 !isValid.password && formData.password
                                   ? "border-red-500 ring-red-500/30"
                                   : ""
                               }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-teal-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <label
                className="block w-full h-12 border-2 border-dashed border-white/30 rounded-xl bg-white/5 
                                flex items-center justify-center text-xs text-gray-400 hover:border-teal-500 
                                hover:bg-teal-500/10 transition-all cursor-pointer group"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                />
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt="Preview"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-teal-500 mr-2"
                  />
                ) : (
                  <Image className="w-4 h-4 mr-1 group-hover:text-teal-400" />
                )}
                {formData.profilePicture ? "Change" : "Photo"} (Optional)
              </label>

              <button
                type="button"
                onClick={sendOtpToAdmin}
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
                    Sending...
                  </>
                ) : (
                  "📧 Send OTP to Administrator"
                )}
              </button>
            </form>
          ) : (
            <>
              <div className="bg-white/10 p-4 rounded-xl border border-white/20 mb-6">
                <p className="text-xs text-gray-400 mb-1">Admin Verification</p>
                <p className="text-sm font-semibold text-white truncate">
                  {otpData?.email}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Enter 6-digit OTP from admin email
                </p>
              </div>

              {showOtpInput ? (
                <form className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Key className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      ref={otpInputRef}
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={handleOtpChange}
                      className={`w-full pl-9 pr-3 py-2.5 bg-white/10 border rounded-xl text-white text-sm font-mono tracking-widest text-center
                                  focus:ring-2 focus:ring-teal-500/50 focus:border-transparent transition-all border-white/20 ${
                                    otp.length === 6
                                      ? "border-emerald-500 bg-emerald-500/10"
                                      : otp.length > 0
                                      ? "border-red-500 ring-red-500/30"
                                      : ""
                                  }`}
                      maxLength={6}
                      disabled={loading}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex-1 py-2.5 px-4 text-sm bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20"
                      disabled={loading}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={resendOtp}
                      className="flex-1 py-2.5 px-4 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all"
                      disabled={loading}
                    >
                      Resend
                    </button>
                    <button
                      type="button"
                      onClick={verifyOtpAndSignup}
                      disabled={!isOtpValid || loading}
                      className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all shadow-lg ${
                        isOtpValid && !loading
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-4 w-4 mx-auto" />
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <Check className="w-16 h-16 text-teal-400 mx-auto mb-4 opacity-75" />
                  <p className="text-sm text-gray-300 mb-2">
                    Ready for admin approval
                  </p>
                  <button
                    type="button"
                    onClick={sendOtpToAdmin}
                    disabled={loading}
                    className={`w-full py-3 px-4 text-sm font-semibold rounded-xl transition-all shadow-lg ${
                      !loading
                        ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 hover:shadow-xl hover:-translate-y-px"
                        : "bg-gray-600 cursor-not-allowed"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4 inline-block" />
                        Sending OTP...
                      </>
                    ) : (
                      "📧 Send OTP to Administrator"
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          <p className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-white/10">
            Already have account?{" "}
            <button
              onClick={() => setMode("signin")}
              className="text-teal-400 hover:text-teal-300 font-semibold underline"
              disabled={loading}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
