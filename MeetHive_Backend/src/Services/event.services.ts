/**
 * @module src/Services/event.services.ts
 * @description holds crud operation and logic for event-related operations.
 */
import prisma from "../config/prisma.js";
import { EventData, UpdateEventData } from "../types/event.types.js";
import { Event } from "@prisma/client";
import HttpError from "../Utils/HttpError.js";

/**
 * @function createEvent
 * @description creates a new event under an organizer profile
 * @param {string} organizerId - the id of the organizer creating the event
 * @param {Object} data - the event details e.g data.title, data.description etc
 * @returns {Promise<success: boolean; message: string; data: Event>} the newly created event, success status and message
 */
const createEvent = async (
  organizerId: string,
  eventData: EventData
): Promise<{ success: boolean; message: string; data: Event }> => {
  const newEvent = await prisma.event.create({
    data: {
      organizerId,
      ...eventData,
    },
  });
  return {
    success: true,
    message: "Event created successfully",
    data: newEvent,
  };
};

/**
 * @function updateEvent
 * @description updates the event details
 * @param {string} eventId - the id of the event to update
 * @param {Object} data - the new data details to update e.g data.title, data.description etc
 * @returns {Promise<success: boolean; message: string; data: Event>} the updated event, success status and message
 */
const updateEvent = async (
  eventId: string,
  data: UpdateEventData
): Promise<{ success: boolean; message: string; data: Event }> => {
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...data,
    },
  });
  return {
    success: true,
    message: "Event updated successfully",
    data: updatedEvent,
  };
};

/**
 * @function getAllEvent
 * @description retrieves all published and non-archived events
 * @returns {Promise<success: boolean; message: string; data: Event[]>} list of events, success status and message
 */
const getAllEvent = async (): Promise<{
  success: boolean;
  message: string;
  data: Event[];
}> => {
  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      isArchived: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return {
    success: true,
    message: "Events retrieved successfully",
    data: events,
  };
};

/**
 * @function getSingleEvent
 * @description fetches a particular event by its id
 * @param {string} eventId - the id of the event to get
 * @returns {Promise<success: boolean; message: string; data: Event>} the gotten event, success status and message
 */
const getSingleEvent = async (
  eventId: string
): Promise<{
  success: boolean;
  message: string;
  data: Event;
}> => {
  const eventData = await prisma.event.findUnique({
    where: { id: eventId, isArchived: false },
    include: {
      organizer: {
        select: {
          name: true,
          slug: true,
          bannerUrl: true,
          logoUrl: true,
        },
      },
    },
  });
  if (!eventData) {
    throw new HttpError(404, "Event not found");
  }
  return {
    success: true,
    message: "Event retrieved successfully",
    data: eventData,
  };
};

/**
 * @function publishEvent
 * @description publishes an event making it visible to users
 * @param {string} eventId - the id of the event to publish
 * @returns {Promise<object>} success status and message
 */
const publishEvent = async (eventId: string): Promise<object> => {
  await prisma.event.update({
    where: { id: eventId },
    data: {
      isPublished: true,
    },
  });
  return { success: true, message: "Event published successfully" };
};

/**
 * @function softDeleteEvent
 * @description soft deletes an event by setting its isArchived field to true
 * @param {string} eventId - the id of the event to soft delete
 * @returns {Promise<object>} success status and message
 */
const softDeleteEvent = async (eventId: string): Promise<object> => {
  await prisma.event.update({
    where: { id: eventId },
    data: {
      isArchived: true,
    },
  });
  return { success: true, message: "Event deleted successfully" };
};

export {
  createEvent,
  updateEvent,
  getAllEvent,
  publishEvent,
  softDeleteEvent,
  getSingleEvent,
};
