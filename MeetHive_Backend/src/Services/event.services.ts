import prisma from "../config/prisma.js";
import { EventData, UpdateEventData } from "../types/event.types.js";
import { Event } from "@prisma/client";

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

const deleteEvent = async (eventId: string): Promise<void> => {
  await prisma.event.delete({
    where: { id: eventId },
  });
};

export { createEvent, updateEvent, deleteEvent };
