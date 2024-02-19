import { Injectable } from '@nestjs/common'
import { path } from 'app-root-path'
import { ensureDir, writeFile } from 'fs-extra'
import { IMediaResponse } from './media.interface'
import { PrismaService } from '@prisma/prisma.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) { }


  async saveMedia(
    media: Express.Multer.File,
    folder = 'default'
  ): Promise<IMediaResponse> {
    const uploadFolder = `${path}/uploads/${folder}`
    await ensureDir(uploadFolder)

    await writeFile(`${uploadFolder}/${media.originalname}`, media.buffer)

    return {
      url: `/uploads/${folder}/${media.originalname}`,
      name: media.originalname
    }
  }

  async saveUserAvatar(media: Express.Multer.File, userId: string): Promise<IMediaResponse> {
    const uploadFolder = `${path}/uploads/avatars`;
    await ensureDir(uploadFolder);

    const avatarFileName = `${userId}-${Date.now()}-${media.originalname}`;
    await writeFile(`${uploadFolder}/${avatarFileName}`, media.buffer);

    const avatarUrl = `${this.configService.get('APP_URL')}/avatars/${avatarFileName}`;
    console.log(avatarUrl)
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    return {
      url: avatarUrl,
      name: avatarFileName,
    };
  }
}
