import { Command } from '@nestjs/cqrs';

export class DeletePresetCommand extends Command<void> {
  readonly id: string;
  readonly userId: string;

  constructor({ id, userId }: { id: string; userId: string }) {
    super();
    this.id = id;
    this.userId = userId;
  }
}
