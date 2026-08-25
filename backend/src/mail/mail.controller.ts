import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { MailService } from './mail.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('In-Game Mailbox')
@Controller('api/mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user mailbox messages' })
  async getMyMail(@Request() req: any) {
    return this.mailService.getMyMail(req.user.userId);
  }

  @Post(':id/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim mail item attachments' })
  async claimAttachment(@Request() req: any, @Param('id') id: string) {
    return this.mailService.claimAttachment(req.user.userId, id);
  }
}
