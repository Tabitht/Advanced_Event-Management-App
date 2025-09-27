import prisma from "../config/prisma.js";
import { Organizer, Role } from "@prisma/client";
import {
  OrganizerData,
  UpdateOrganizerData,
} from "../types/organizer.types.js";
import HttpError from "../Utils/HttpError.js";

const createOrganizer = async (
  userId: string,
  data: OrganizerData
): Promise<Organizer> => {
  return prisma.$transaction(async (transaction) => {
    const organizer = await transaction.organizer.create({
      data: {
        userId,
        ...data,
      },
    });

    await transaction.user.update({
      where: { id: userId },
      data: { role: Role.ORGANIZER },
    });

    return organizer;
  });
};

const updateOrganizer = async (
  organizerId: string,
  data: UpdateOrganizerData
): Promise<Organizer> => {
  const existingOrganizer = await prisma.organizer.findUnique({
    where: { id: organizerId },
  });
  if (!existingOrganizer) {
    throw new HttpError(404, "Organizer not found");
  }
  const updatedOrganizer = await prisma.organizer.update({
    where: { id: existingOrganizer.id },
    data: {
      ...data,
    },
  });
  return updatedOrganizer;
};
export { createOrganizer, updateOrganizer };
