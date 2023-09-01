import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@klintonc-org/ticketing-common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
