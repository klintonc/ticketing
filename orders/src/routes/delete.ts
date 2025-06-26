import express, { Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthenticatedError,
  NotFoundError,
  requireAuth,
} from '@klintonc-org/ticketing-common';

import { Order, OrderStatus } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthenticatedError();
    }

    // a paid order keeps its ticket; cancelling it would release the ticket again
    if (order.status === OrderStatus.Complete) {
      throw new BadRequestError('Cannot cancel a paid order');
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // publishing an event saying this wa cancelled!
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      }
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
