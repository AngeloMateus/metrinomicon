import { useTransitionRouter } from "next-view-transitions";
import React, { createContext, ReactElement, useContext, useEffect, useState } from "react";

export const SessionContext = createContext<SessionContextInterface>({} as SessionContextInterface);

export interface UserDataInterface {
  token: string;
  user: string;
}

interface SessionContextInterface {
  login: (userDate: UserDataInterface) => void;
  logout: VoidFunction;
  session: UserDataInterface | null;
}

export const SessionProvider = ({ children }: { children: ReactElement | React.ReactNode }) => {
  const initial_session = typeof window !== "undefined" && sessionStorage.getItem("session");
  const [session, setSession] = useState<UserDataInterface | null>(
    initial_session ? JSON.parse(initial_session) : null,
  );
  const router = useTransitionRouter();

  const login = (userData: UserDataInterface) => {
    setSession(userData);
    sessionStorage.setItem("session", JSON.stringify(userData));
  };

  const logout = () => {
    sessionStorage.removeItem("session");
    setSession(null);
    router.replace("/");
  };

  useEffect(() => {
    const localSession = sessionStorage.getItem("session");
    if (!localSession || !session?.token) {
      router.replace("/");
    }

    if (localSession) {
      setSession(JSON.parse(localSession));
    }
  }, []);

  return (
    <SessionContext.Provider value={{ session, login, logout }}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  return useContext(SessionContext);
};
