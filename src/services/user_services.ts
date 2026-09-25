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
  var result: UserResponde = {
    data: [],
    total: 0,
  };

  const responde = await fetch(`${API_BASE_URL}/users`);
  if (!responde.ok) {
    throw Error("Fucking shit");
  }

  result = await responde.json();

  return result;
}
