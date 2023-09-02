import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@klintonc-org/ticketing-common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
