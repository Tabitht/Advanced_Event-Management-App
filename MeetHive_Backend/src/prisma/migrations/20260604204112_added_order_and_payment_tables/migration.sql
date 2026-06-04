-- CreateEnum
CREATE TYPE "MeetHive_Schema"."OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MeetHive_Schema"."PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "MeetHive_Schema"."PaymentProvider" AS ENUM ('STRIPE', 'PAYSTACK', 'FLUTTERWAVE');

-- CreateEnum
CREATE TYPE "MeetHive_Schema"."Status" AS ENUM ('ISSUED', 'USED', 'CANCELLED');

-- CreateTable
CREATE TABLE "MeetHive_Schema"."Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "orderReference" TEXT NOT NULL,
    "status" "MeetHive_Schema"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetHive_Schema"."OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetHive_Schema"."Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" "MeetHive_Schema"."PaymentProvider" NOT NULL,
    "providerTxId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "MeetHive_Schema"."PaymentStatus" NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetHive_Schema"."Registration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetHive_Schema"."ScanLog" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT,
    "masterId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "ScanLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetHive_Schema"."TicketMaster" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "purchaserUserId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "totalQty" INTEGER NOT NULL,
    "remainingQty" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetHive_Schema"."Ticket" (
    "id" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "assignedUserId" TEXT NOT NULL,
    "status" "MeetHive_Schema"."Status" NOT NULL DEFAULT 'ISSUED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetHive_Schema"."EventTicketType" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventTicketType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderReference_key" ON "MeetHive_Schema"."Order"("orderReference");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerTxId_key" ON "MeetHive_Schema"."Payment"("providerTxId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketMaster_orderId_key" ON "MeetHive_Schema"."TicketMaster"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_code_key" ON "MeetHive_Schema"."Ticket"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_email_key" ON "MeetHive_Schema"."Ticket"("email");

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MeetHive_Schema"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Order" ADD CONSTRAINT "Order_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "MeetHive_Schema"."Organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Order" ADD CONSTRAINT "Order_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "MeetHive_Schema"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "MeetHive_Schema"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."OrderItem" ADD CONSTRAINT "OrderItem_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "MeetHive_Schema"."EventTicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "MeetHive_Schema"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "MeetHive_Schema"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Registration" ADD CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MeetHive_Schema"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Registration" ADD CONSTRAINT "Registration_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "MeetHive_Schema"."Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."TicketMaster" ADD CONSTRAINT "TicketMaster_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "MeetHive_Schema"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."TicketMaster" ADD CONSTRAINT "TicketMaster_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "MeetHive_Schema"."EventTicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Ticket" ADD CONSTRAINT "Ticket_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "MeetHive_Schema"."TicketMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Ticket" ADD CONSTRAINT "Ticket_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "MeetHive_Schema"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."EventTicketType" ADD CONSTRAINT "EventTicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "MeetHive_Schema"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
