import { Controller, Query, UploadedFile } from '@nestjs/common'
import { HttpCode, Post, UseInterceptors } from '@nestjs/common/decorators'
import { FileInterceptor } from '@nestjs/platform-express'
import { MediaService } from './media.service'
import { Auth } from '@shared/decorators/auth.decorator'
import { CurrentUser } from '@shared/decorators/current-user.decorator'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  @HttpCode(200)
  @Post()
  @Auth()
  @UseInterceptors(FileInterceptor('media'))
  async uploadImage(
    @UploadedFile() media: Express.Multer.File,
    @Query('folder') folder?: string
  ) {
    return this.mediaService.saveMedia(media, folder)
  }

  @Auth()
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUserAvatar(@UploadedFile() avatar: Express.Multer.File, @CurrentUser('id') id: string): Promise<any> {
    const updatedAvatar = await this.mediaService.saveUserAvatar(avatar, id);
    return { avatar: updatedAvatar.url };
  }
}