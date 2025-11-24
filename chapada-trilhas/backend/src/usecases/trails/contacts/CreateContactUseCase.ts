import { ContactRepository } from "../../domain/repositories/ContactRepository";

interface Input {
  name: string;
  email: string;
  message: string;
}

export class CreateContactUseCase {
  constructor(private contactRepo: ContactRepository) {}

  async execute(input: Input) {
    return this.contactRepo.create({
      name: input.name,
      email: input.email,
      message: input.message
    });
  }
}
