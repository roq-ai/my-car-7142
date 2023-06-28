import type { NextApiRequest, NextApiResponse } from 'next';
import { roqClient } from 'server/roq';
import { prisma } from 'server/db';
import { errorHandlerMiddleware } from 'server/middlewares';
import { carValidationSchema } from 'validationSchema/cars';
import { HttpMethod, convertMethodToOperation, convertQueryToPrismaUtil } from 'server/utils';
import { getServerSession } from '@roq/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId, user } = await getServerSession(req);
  await prisma.car
    .withAuthorization({
      roqUserId,
      tenantId: user.tenantId,
      roles: user.roles,
    })
    .hasAccess(req.query.id as string, convertMethodToOperation(req.method as HttpMethod));

  switch (req.method) {
    case 'GET':
      return getCarById();
    case 'PUT':
      return updateCarById();
    case 'DELETE':
      return deleteCarById();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getCarById() {
    const data = await prisma.car.findFirst(convertQueryToPrismaUtil(req.query, 'car'));
    return res.status(200).json(data);
  }

  async function updateCarById() {
    await carValidationSchema.validate(req.body);
    const data = await prisma.car.update({
      where: { id: req.query.id as string },
      data: {
        ...req.body,
      },
    });

    return res.status(200).json(data);
  }
  async function deleteCarById() {
    const data = await prisma.car.delete({
      where: { id: req.query.id as string },
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(handler)(req, res);
}
