/*
  Warnings:

  - You are about to drop the column `chatId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `messages` table. All the data in the column will be lost.
  - Added the required column `chat_id` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_chatId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderId_fkey";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "chatId",
DROP COLUMN "senderId",
ADD COLUMN     "chat_id" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "sender_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
