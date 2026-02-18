"use client";

import { API, baseURL } from "@/Utils/Utils";
import React, {
  createContext,
  useEffect,
  useReducer,
  useState,
  ReactNode,
  Dispatch,
  useCallback
} from "react";
import { useRouter } from "next/navigation";

interface UserState {
  token: string | null;
  userId: string | null;
  profilepic: string | null;
  name: string | null;
  role: string | null;
}

const defaultState: UserState = {
  token: null,
  userId: null,
  profilepic: null,
  name: null,
  role: null,
};

type ApiResponse = {
  status: number;
  data: any;
};

interface ApiBody {
  [key: string]: any;
}

interface ActivityBody {
  companyId: string;
  userId: string;
}

interface ApiResponsePromise {
  (body: ApiBody): Promise<ApiResponse>;
}

interface ActivityLogPromise {
  (body: ActivityBody): Promise<ApiResponse>;
}

interface AnnouncementPromise {
  (body: { companyId: string }): Promise<ApiResponse>;
}

type UserAction =
  | { type: "SIGN_IN"; payload: UserState }
  | { type: "UPDATE_PROFILE"; payload: string }
  | { type: "SIGN_OUT" };

const reducer: React.Reducer<UserState, UserAction> = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case "SIGN_IN": {
      const signinState: UserState = { ...action.payload };
      if (typeof window !== "undefined") {
        localStorage.setItem("UserData", JSON.stringify(signinState));
        if (signinState.token) {
          document.cookie = `token=${signinState.token}; path=/; SameSite=Lax`;
        }
        if (signinState.userId) {
          document.cookie = `userId=${signinState.userId}; path=/; SameSite=Lax`;
        }
      }
      return signinState;
    }

    case "UPDATE_PROFILE": {
      const updatedState: UserState = { ...state, profilepic: action.payload };
      if (typeof window !== "undefined") {
        localStorage.setItem("UserData", JSON.stringify(updatedState));
      }
      return updatedState;
    }

    case "SIGN_OUT": {
      const signoutState: UserState = { token: null, userId: null, profilepic: null, name: null, role: null };
      if (typeof window !== "undefined") {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
      return signoutState;
    }

    default:
      return state;
  }
};

type UserDispatch = Dispatch<UserAction>;

interface UserContextType {
  UserAuthData: UserState;
  Userdispatch: UserDispatch;
  logout: () => void;
  initialStateLoaded: boolean;
  UserSignIn: ApiResponsePromise;
  UserSignUp: ApiResponsePromise;
  UPDATEUSER: ApiResponsePromise;
  recordActivity: ApiResponsePromise;
  StoreSessionData: ApiResponsePromise;
  MemberActivitylog: ActivityLogPromise;
  GetSystemAnnouncement: AnnouncementPromise;
  PasswordUpdate: ApiResponsePromise;
}

export const UserContext = createContext<UserContextType | null>(null);

async function UserSignUp(body: ApiBody): Promise<ApiResponse> {
  try {
    const response = await API.post(`${baseURL}/auth/signup`, body);
    return { status: response?.status, data: response?.data };
  } catch (error: any) {
    return { status: error?.response?.status, data: error?.response?.data };
  }
}

async function UserSignIn(body: ApiBody): Promise<ApiResponse> {
  try {
    const response = await API.post(`${baseURL}/auth/signin`, body);
    return { status: response?.status, data: response?.data };
  } catch (error: any) {
    return { status: error?.response?.status, data: error?.response?.data };
  }
}

async function UPDATEUSER(body: ApiBody): Promise<ApiResponse> {
  try {
    const response = await API.put(`${baseURL}/Member/UpdateMember`, body);
    return { status: response?.status, data: response?.data };
  } catch (error: any) {
    return { status: error?.response?.status, data: error?.response?.data };
  }
}

async function recordActivity(body: ApiBody): Promise<ApiResponse> {
  try {
    const response = await API.post(`${baseURL}/activity/storeactivity`, body);
    return { status: response?.status, data: response?.data };
  } catch (error: any) {
    return { status: error?.response?.status, data: error?.response?.data };
  }
}

async function StoreSessionData(body: ApiBody): Promise<ApiResponse> {
  try {
    const response = await API.post(`${baseURL}/session/storesessiondata`, body);
    return { status: response?.status, data: response?.data };
  } catch (error: any) {
    return { status: error?.response?.status, data: error?.response?.data };
  }
}

async function MemberActivitylog(body: ActivityBody): Promise<ApiResponse> {
  try {
    const response = await API.get(`${baseURL}/activity/getActivityforMember`, {
      params: { companyId: body.companyId, userId: body.userId }
    });
    return { status: response?.status, data: response?.data };
  } catch (error: any) {
    return { status: error?.response?.status, data: error?.response?.data };
  }
}

async function GetSystemAnnouncement(body: { companyId: string }): Promise<ApiResponse> {
  try {
    const response = await API.get(`${baseURL}/SystemAnnouncements/GetSystemAnnouncements`, {
      params: { companyId: body.companyId }
    });
    return { status: response?.status, data: response?.data };
  } catch (error: any) {
    return { status: error?.response?.status, data: error?.response?.data };
  }
}

async function PasswordUpdate(body: ApiBody): Promise<ApiResponse> {
  try {
    const response = await API.put(`${baseURL}/profile/updatepassword/`, body);
    return { status: response?.status, data: response?.data };
  } catch (error: any) {
    return { status: error?.response?.status, data: error?.response?.data };
  }
}

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [initialStateLoaded, setInitialStateLoaded] = useState(false);
  const [state, Userdispatch] = useReducer(reducer, defaultState);
  const router = useRouter();

  const initializeUserData = useCallback(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("UserData");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as UserState;
          Userdispatch({ type: "SIGN_IN", payload: parsed });
        } catch {
          console.warn("Failed to parse UserData");
        }
      }
      setInitialStateLoaded(true);
    }
  }, [Userdispatch]);

  useEffect(() => {
    initializeUserData();
  }, [initializeUserData]);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("UserData");
    }
    Userdispatch({ type: "SIGN_OUT" });
    router.replace("/Dashboard/pages/Auth");
  }, [router]);

  if (!initialStateLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider
      value={{
        UserAuthData: state,
        Userdispatch,
        logout,
        initialStateLoaded,
        UserSignIn,
        UserSignUp,
        UPDATEUSER,
        recordActivity,
        StoreSessionData,
        MemberActivitylog,
        GetSystemAnnouncement,
        PasswordUpdate
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
