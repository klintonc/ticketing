import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@klintonc-org/ticketing-common';

export class TicketCreatePublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
