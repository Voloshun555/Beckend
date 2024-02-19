import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWriteStream } from 'fs';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ChatroomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) { }

  async getChatroom(id: string) {
    return this.prisma.chat.findUnique({
      where: {
        id,
      },
    });
  }

  async createChatroom(name: string, sub: string) {
    const existingChatroom = await this.prisma.chat.findFirst({
      where: {
        name,
      },
    });
    if (existingChatroom) {
      throw new BadRequestException({ name: 'Chatroom already exists' });
    }
    return this.prisma.chat.create({
      data: {
        name,
        ownerId: sub,
        users: { connect: { id: sub } },
      },
    });
  }

  async addUsersToChatroom(chatroomId: string, userIds: string[]) {
    const existingChatroom = await this.prisma.chat.findUnique({
      where: {
        id: chatroomId,
      },
    });
    if (!existingChatroom) {
      throw new BadRequestException({ chatroomId: 'Chatroom does not exist' });
    }

    return await this.prisma.chat.update({
      where: {
        id: chatroomId,
      },
      data: {
        users: {
          connect: userIds.map((id) => ({ id: id })),
        },
      },
      include: {
        users: true,
      },
    });
  }
  async getChatroomsForUser(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: {
          orderBy: {
            createdAt: 'desc',
          },
        }, // Eager loading users

        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }
  async sendMessage(
    chatroomId: string,
    message: string,
    userId: string,
  ) {
    return await this.prisma.message.create({
      data: {
        content: message,
        chatId: chatroomId,
        senderId: userId,
      },
      include: {
        chat: {
          include: {
            users: true, 
          },
        }, 
        sender: true,
      },
    });
  }

  async saveImage(image: {
    createReadStream: () => any;
    filename: string;
    mimetype: string;
  }) {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(image.mimetype)) {
      throw new BadRequestException({ image: 'Invalid image type' });
    }

    const imageName = `${Date.now()}-${image.filename}`;
    const imagePath = `${this.configService.get('APP_URL')}/${imageName}`;
    const stream = image.createReadStream();
    const outputPath = `${imagePath}`;
    const writeStream = createWriteStream(outputPath);
    stream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    return imagePath;
  }
  async getMessagesForChatroom(chatroomId: string) {
    return await this.prisma.message.findMany({
      where: {
        chatId: chatroomId,
      },
      include: {
        chat: {
          include: {
            users: {
              orderBy: {
                createdAt: 'asc',
              },
            }, 
          },
        }, 
        sender: true, 
      },
    });
  }

  async deleteChatroom(chatroomId: string) {
    return this.prisma.chat.delete({
      where: {
        id: chatroomId,
      },
    });
  }

  getById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id
      },
      include: {
        chats: true,
        messages: true
      }
    })
  }

  async getProfile(id: string) {
    const profile = await this.getById(id)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = profile

    return {
      user: rest
    }
  }

}

