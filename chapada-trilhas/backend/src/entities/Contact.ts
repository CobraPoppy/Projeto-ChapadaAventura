export interface Contact {
  id: number;
  name: string;
  email: string;
  message: string;
  status: "novo" | "lido" | "respondido";
  createdAt: Date;
}
