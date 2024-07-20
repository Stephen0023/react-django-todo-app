import { createContext, useState, useContext, useEffect } from "react";
import type { User } from "../types/User";
import { fetchTasks } from "../apis/api";

export const defaultUser: User = {
  name: null,
  createdAt: new Date(),
  tasks: [],
  theme: "system",
  darkmode: "auto",

  categories: [
    {
      id: "857f0db6-43b2-43eb-8143-ec4e26472516",
      name: "Home",
      emoji: "1f3e0",
      color: "#1fff44",
    },
    {
      id: "0292cba5-f6e2-41c4-b5a7-c59a0aaecfe3",
      name: "Work",
      emoji: "1f3e2",
      color: "#248eff",
    },
    {
      id: "a47a4af1-d720-41eb-9121-d3728605a62b",
      name: "Personal",
      emoji: "1f464",
      color: "#e843fe",
    },
    {
      id: "393068a9-9db7-4dfa-a00f-cd359f8024e8",
      name: "Health/Fitness",
      emoji: "1f4aa",
      color: "#ffdf3d",
    },
    {
      id: "afa0fdb4-f668-4d5a-9ad0-4e22d2b8e841",
      name: "Education",
      emoji: "1f4da",
      color: "#ff8e24",
    },
  ],
  colorList: [
    "#FF69B4",
    "#FF22B4",
    "#C6A7FF",
    "#7ACCFA",
    "#4898F4",
    "#5061FF",
    "#3DFF7F",
    "#3AE836",
    "#FFEA28",
    "#F9BE26",
    "#FF9518",
    "#FF5018",
    "#FF2F2F",
  ],
};

interface UserProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

export const UserContext = createContext<UserProps>({
  user: defaultUser,
  setUser: () => {},
});

export default function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User>(defaultUser);

  useEffect(() => {
    const fetchAndSetTodos = async () => {
      try {
        const response = await fetchTasks();
        const tasks = response.map((task) => ({
          ...task,
          done: task.completed, // Default value or transform based on your needs
          pinned: false, // Default value or transform based on your needs
          color: "#88c9f2", // Default value or transform based on your needs
          date: new Date(task.date),
          deadline: task.deadline ? new Date(task.deadline) : undefined,
        }));
        console.log(tasks);
        setUser((prevUser) => ({ ...prevUser, tasks }));
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };

    fetchAndSetTodos();
  }, []);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (context === null) {
    throw new Error("useUser must be used within a UserContextProvider");
  }

  return context;
}
