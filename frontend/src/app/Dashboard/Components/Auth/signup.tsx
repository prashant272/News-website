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
  Image as ImageIcon,
  Loader2,
  Key,
  Check,
} from "lucide-react";
import { AuthChildProps } from "./types";
import styles from "./SignUp.module.scss";

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
    role: "USER",
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
        reader.onload = (ev) =>
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
  }, [otpData, otp, VERIFYOTP, UserSignUp, setMode]);

  useEffect(() => {
    if (step === "otp" && otpInputRef.current && showOtpInput) {
      otpInputRef.current.focus();
    }
  }, [step, showOtpInput]);

  const RoleIcon = ({ role }: { role: Role }) => {
    const icons = { USER: Users, ADMIN: Shield, SUPER_ADMIN: Crown };
    const Icon = icons[role];
    return <Icon className={`${styles.roleIcon} ${styles[role]}`} />;
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
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            {step === "form" ? (
              <Users className={styles.headerIcon} />
            ) : (
              <Key className={styles.headerIcon} />
            )}
          </div>
          <h2 className={styles.title}>
            {step === "form" ? "Create Account" : "Admin Approval"}
          </h2>
          {step === "otp" && (
            <p className={styles.subtitle}>
              Enter 6-digit code from administrator email
            </p>
          )}
        </div>

        {step === "form" ? (
          <form className={styles.form}>
            <div className={styles.selectWrapper}>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: e.target.value as Role,
                  }))
                }
                className={styles.select}
                disabled={loading}
              >
                <option value="USER">👤 User</option>
                <option value="ADMIN">🛡️ Admin</option>
                <option value="SUPER_ADMIN">👑 Super Admin</option>
              </select>
              <RoleIcon role={formData.role} />
            </div>

            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <Users className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange("name")}
                  className={styles.input}
                  disabled={loading}
                />
              </div>

              <div className={styles.inputGroup}>
                <Mail className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  className={`${styles.input} ${
                    !isValid.email && formData.email ? styles.inputError : ""
                  }`}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <Lock className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (8+ chars)"
                value={formData.password}
                onChange={handleChange("password")}
                className={`${styles.input} ${
                  !isValid.password && formData.password ? styles.inputError : ""
                }`}
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

            <label className={styles.fileLabel}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.hidden}
                disabled={loading}
              />
              {formData.profilePicture ? (
                <img
                  src={formData.profilePicture}
                  alt="Preview"
                  className={styles.previewImage}
                />
              ) : (
                <ImageIcon className={styles.fileIcon} />
              )}
              {formData.profilePicture ? "Change" : "Photo"} (Optional)
            </label>

            <button
              type="button"
              onClick={sendOtpToAdmin}
              disabled={!isFormValid || loading}
              className={`${styles.submitBtn} ${
                !isFormValid || loading ? styles.disabled : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className={styles.spinner} />
                  Sending...
                </>
              ) : (
                "📧 Send OTP to Administrator"
              )}
            </button>
          </form>
        ) : (
          <>
            <div className={styles.infoBox}>
              <p className={styles.infoLabel}>Admin Verification</p>
              <p className={styles.infoEmail}>{otpData?.email}</p>
              <p className={styles.infoText}>
                Enter 6-digit OTP from admin email
              </p>
            </div>

            {showOtpInput ? (
              <form className={styles.form}>
                <div className={styles.inputGroup}>
                  <Key className={styles.inputIcon} />
                  <input
                    ref={otpInputRef}
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={handleOtpChange}
                    className={`${styles.otpInput} ${
                      otp.length === 6
                        ? styles.otpSuccess
                        : otp.length > 0
                        ? styles.otpError
                        : ""
                    }`}
                    maxLength={6}
                    disabled={loading}
                  />
                </div>

                <div className={styles.otpActions}>
                  <button
                    type="button"
                    onClick={goBack}
                    className={styles.backBtn}
                    disabled={loading}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={resendOtp}
                    className={styles.resendBtn}
                    disabled={loading}
                  >
                    Resend
                  </button>
                  <button
                    type="button"
                    onClick={verifyOtpAndSignup}
                    disabled={!isOtpValid || loading}
                    className={`${styles.createBtn} ${
                      !isOtpValid || loading ? styles.disabled : ""
                    }`}
                  >
                    {loading ? (
                      <Loader2 className={styles.spinner} />
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.readyBox}>
                <Check className={styles.readyIcon} />
                <p className={styles.readyText}>Ready for admin approval</p>
                <button
                  type="button"
                  onClick={sendOtpToAdmin}
                  disabled={loading}
                  className={`${styles.submitBtn} ${
                    loading ? styles.disabled : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className={styles.spinner} />
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

        <p className={styles.footerText}>
          Already have account?{" "}
          <button
            onClick={() => setMode("signin")}
            className={styles.signInLink}
            disabled={loading}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};