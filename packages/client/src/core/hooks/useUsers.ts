import { useState, useEffect } from "react";
import type { UserDTO } from "@dwilive/shared";
import { MOCK_USERS } from "../mocks";

export const useUsers = () => {
  const [data, setData] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API network delay
    const timer = setTimeout(() => {
      setData(MOCK_USERS);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { users: data, isLoading };
};
