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
import HttpError from "../Utils/httpError.js";

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
): Promise<{ success: boolean; message: string; data: Organizer }> => {
  const existingOrganizer = await prisma.organizer.findUnique({
    where: { userId },
  });
  if (existingOrganizer) {
    throw new HttpError(409, "Organizer account already exist for User");
  }
  try {
    const organizerData = await prisma.$transaction(async (transaction) => {
      const organizer = await transaction.organizer.create({
        data: {
          userId,
          slug: data.name.toLowerCase().replace(/\s+/g, "-"),
          ...data,
        },
      });

      await transaction.user.update({
        where: { id: userId },
        data: { role: Role.ORGANIZER },
      });

      return organizer;
    });
    return {
      success: true,
      message: "Organizer profile created successfully",
      data: organizerData,
    };
  } catch (error) {
    console.log("Error creating organizer profile:", error);
    throw new HttpError(500, "Error creating organizer Profile");
  }
};

/**
 * @function updateOrganizer
 * @description updates the organizer profile details
 * @param {string} organizerId - the id of the organizer profile to update
 * @param {Object} data - the new data details to update e.g data.name, data.bio etc
 * @returns {Promise<success: boolean; message: string; data: Organizer>} the updated organizer, success status and message
 */
const updateOrganizer = async (
  organizerId: string,
  data: UpdateOrganizerData
): Promise<{
  success: boolean;
  message: string;
  data: Organizer;
}> => {
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
  return {
    success: true,
    message: "Organizer profile updated successfully",
    data: updatedOrganizer,
  };
};

/**
 * @function getSingleOrganizer
 * @description fetches a particular organizer profile with their upcoming events
 * @param {string} organizer_id - the id of the organizer profile to get
 * @returns {Promise<success: boolean; message: string; data: Organizer >} -
 * the gotten organizer profile with events, success status and message
 */
const getSingleOrganizer = async (
  organizer_id: string
): Promise<{
  success: boolean;
  message: string;
  data: Organizer;
}> => {
  const organizerData = await prisma.organizer.findUnique({
    where: { id: organizer_id },
    include: {
      event: {
        where: {
          startAt: {
            gte: new Date(),
          },
          isArchived: false,
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
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
  return {
    success: true,
    message: "Organizer retrieved successfully",
    data: organizerData,
  };
};

/**
 * @function getAllOrganizers
 * @description fetches all organizers in the database
 * @returns {Promise<success: boolean; message: string; data: Organizer[]>} list of organizers, success status and message
 */
const getAllOrganizers = async (): Promise<{
  success: boolean;
  message: string;
  data: Organizer[];
}> => {
  const organizers = await prisma.organizer.findMany();
  return {
    success: true,
    message: "Organizers retrieved successfully",
    data: organizers,
  };
};

export {
  createOrganizer,
  updateOrganizer,
  getSingleOrganizer,
  getAllOrganizers,
};
