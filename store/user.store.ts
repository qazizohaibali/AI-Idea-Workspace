import { create } from "zustand";
import { User } from "@/types";

type UserStore = {
  loginUser: User | null;
  setLoginUser: (newUser: User) => void;
  logoutUser: () => void;
};

const userStore = create<UserStore>((set) => ({
  loginUser: null,
  setLoginUser: (newUser) => set({ loginUser: newUser }),
  logoutUser: () => set({ loginUser: null }),
}));

export default userStore;
