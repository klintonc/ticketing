import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@klintonc-org/ticketing-common';

export class TicketCreatePublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
