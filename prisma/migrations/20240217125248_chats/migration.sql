-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChatToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChatToUser_AB_unique" ON "_ChatToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatToUser_B_index" ON "_ChatToUser"("B");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatToUser" ADD CONSTRAINT "_ChatToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatToUser" ADD CONSTRAINT "_ChatToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
