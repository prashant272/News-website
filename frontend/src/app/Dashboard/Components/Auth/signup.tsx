"use client";

import React, {
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { Bounce, toast } from "react-toastify";
import { UserContext } from "@/app/Dashboard/Context/ManageUserContext";
import {
  Users,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Key,
} from "lucide-react";
import { AuthChildProps } from "./types";
import styles from "./SignUp.module.scss";

interface SignUpProps {
  setMode: (mode: string) => void;
}

type Role = "USER" | "ADMIN";

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  role: Role;
  profilePicture?: string;
  secretKey: string;
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
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
    role: "USER",
    secretKey: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { UserSignUp } = useContext(UserContext) as any;

  const isValid = useMemo(
    () => ({
      email: EMAIL_REGEX.test(formData.email),
      password: PASSWORD_REGEX.test(formData.password),
    }),
    [formData]
  );

  // Secret key is now required for ALL roles
  const isFormValid = 
    formData.name.trim() && 
    isValid.email && 
    isValid.password &&
    formData.secretKey.trim();

  const handleChange = useCallback(
    (field: keyof SignUpFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value as any }));
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

  const handleSignUp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!isFormValid) {
        toast.error("Please fill all fields correctly", {
          position: "top-center",
          transition: Bounce,
        });
        return;
      }

      try {
        setLoading(true);

        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          ProfilePicture: formData.profilePicture,
          secretKey: formData.secretKey, // Always send secret key
        };

        const signupRes: SignUpResponse = await UserSignUp(payload);

        if (signupRes.status === 201) {
          toast.success("🎉 Account created successfully! Welcome aboard!", {
            position: "top-center",
            autoClose: 3000,
            transition: Bounce,
          });
          setTimeout(() => setMode("signin"), 1500);
        } else if (signupRes.status === 409) {
          toast.error(signupRes.data?.msg || "User already exists", {
            position: "top-center",
            transition: Bounce,
          });
        } else if (signupRes.status === 401) {
          toast.error(signupRes.data?.msg || "Invalid secret key", {
            position: "top-center",
            transition: Bounce,
          });
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
    },
    [formData, isFormValid, UserSignUp, setMode]
  );

  const RoleIcon = ({ role }: { role: Role }) => {
    const icons = { USER: Users, ADMIN: Shield };
    const Icon = icons[role];
    return <Icon className={`${styles.roleIcon} ${styles[role]}`} />;
  };

  return (
    <div className={styles.authPageRoot}>
      <div className={styles.authCardBox}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Users className={styles.headerIcon} />
          </div>
          <h2 className={styles.title}>Create Account</h2>
        </div>

        <form onSubmit={handleSignUp} className={styles.form}>
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
              placeholder="Password (8+ chars, A-Z, a-z, 0-9, @$!%*?&)"
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

          {/* Secret Key Input - Required for ALL roles */}
          <div className={styles.inputGroup}>
            <Key className={styles.inputIcon} />
            <input
              type={showSecretKey ? "text" : "password"}
              placeholder="Secret Key (Required)"
              value={formData.secretKey}
              onChange={handleChange("secretKey")}
              className={styles.input}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowSecretKey((v) => !v)}
              className={styles.passwordToggle}
            >
              {showSecretKey ? <EyeOff /> : <Eye />}
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
            type="submit"
            disabled={!isFormValid || loading}
            className={`${styles.submitBtn} ${
              !isFormValid || loading ? styles.disabled : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className={styles.spinner} />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

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
