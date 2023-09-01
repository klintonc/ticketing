import {
  Subjects,
  Publisher,
  OrderCancelledEvent,
} from '@klintonc-org/ticketing-common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
