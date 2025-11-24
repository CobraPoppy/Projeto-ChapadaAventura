import { Contact } from "../entities/Contact";

export interface ContactRepository {
  create(data: Omit<Contact, "id" | "createdAt" | "status">): Promise<Contact>;
}
