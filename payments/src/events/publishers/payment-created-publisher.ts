import {
  Subjects,
  Publisher,
  PaymentCreatedEvent,
} from '@klintonc-org/ticketing-common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
