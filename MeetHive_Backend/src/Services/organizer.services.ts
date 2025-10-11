/**
 * @module src/Services/organizer.services.transaction
 * @description holds the crud operation and logic for the organizer feature
 */
import prisma from "../config/prisma.js";
import { Organizer, Role } from "@prisma/client";
import {
  OrganizerData,
  UpdateOrganizerData,
} from "../types/organizer.types.js";
import HttpError from "../Utils/HttpError.js";

/**
 * @function createOrganizer
 * @description creates the organizer profile for an authenticated user
 * @param {string} userId - the id of the user to create an organizer profile for
 * @param {Object} data - the organizer profile details e.g data.name, data.bio etc
 * @returns {Promise<object>} the newly created organizer
 */
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

/**
 * @function updateOrganizer
 * @description updates the organizer profile details
 * @param {string} organizerId - the id of the organizer profile to update
 * @param {Object} data - the new data details to update e.g data.name, data.bio etc
 * @returns {Promise<object>} the updated organizer
 */
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

/**
 * @function getSingleOrganizer
 * @description fetches a particular organizer profile
 * @param {string} organizer_id - the id of the organizer profile to get
 * @returns {Promise<object>} the gotten organizer profile
 */
const getSingleOrganizer = async (organizer_id: string): Promise<Organizer> => {
  const organizerData = await prisma.organizer.findUnique({
    where: { id: organizer_id },
    include: {
      event: {
        where: {
          startAt: {
            gte: new Date(),
          },
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          startAt: true,
          endAt: true,
          location: true,
          isPublished: true,
        },
      },
    },
  });

  if (!organizerData) {
    throw new HttpError(404, "Organizer not found");
  }
  return organizerData;
};

/**
 * @function getAllOrganizers
 * @description fetches all organizers in the database
 * @returns {Promise<Array<object>>} an array of all the organizers profiles
 */
const getAllOrganizers = async (): Promise<Array<Organizer>> => {
  const organizers = await prisma.organizer.findMany();
  return organizers;
};

export {
  createOrganizer,
  updateOrganizer,
  getSingleOrganizer,
  getAllOrganizers,
};
