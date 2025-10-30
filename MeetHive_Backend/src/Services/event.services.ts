import prisma from "../config/prisma.js";
import { EventData, UpdateEventData } from "../types/event.types.js";
import { Event } from "@prisma/client";
import HttpError from "../Utils/HttpError.js";

const createEvent = async (
  organizerId: string,
  data: EventData
): Promise<Event> => {
  const newEvent = await prisma.event.create({
    data: {
      organizerId,
      ...data,
    },
  });
  return newEvent;
};

const updateEvent = async (
  eventId: string,
  data: UpdateEventData
): Promise<Event> => {
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...data,
    },
  });
  return updatedEvent;
};

const getAllEvent = async (): Promise<Array<Event>> => {
  const events = await prisma.event.findMany();
  return events;
};

const getSingleEvent = async (eventId: string): Promise<Event> => {
  const eventData = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!eventData) {
    throw new HttpError(404, "Event not found");
  }
  return eventData;
};

const publishEvent = async (eventId: string): Promise<void> => {
  await prisma.event.update({
    where: { id: eventId },
    data: {
      isPublished: true,
    },
  });
};
const softDeleteEvent = async (eventId: string): Promise<void> => {
  await prisma.event.update({
    where: { id: eventId },
    data: {
      isArchived: true,
    },
  });
};

export {
  createEvent,
  updateEvent,
  getAllEvent,
  publishEvent,
  softDeleteEvent,
  getSingleEvent,
};
