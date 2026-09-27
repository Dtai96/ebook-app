interface User {
  id: number;
  name: string;
  email: string;
}
interface UserResponde {
  data: User[];
  total: number;
}
const API_BASE_URL = "http://localhost:8000/api/";

export async function getUsers(): Promise<UserResponde> {
  let result: UserResponde = {
    data: [],
    total: 0,
  };

  const responde = await fetch(`${API_BASE_URL}/users`);
  if (!responde.ok) {
    throw Error("Không thể tải danh sách người dùng.");
  }

  result = await responde.json();

  return result;
}
