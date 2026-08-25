import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Friends')
@Controller('api/friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user accepted friends list' })
  async getMyFriends(@Request() req: any) {
    const friends = await this.friendsService.getFriendsList(req.user.userId);
    return friends.map((u) => ({
      userId: u.id,
      username: u.username,
      displayName: u.profile ? u.profile.displayName : u.username,
      eloRating: u.profile ? u.profile.eloRating : 1200,
      isOnline: u.profile ? u.profile.isOnline : false,
    }));
  }

  @Post('request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send friend request by username' })
  async sendRequest(@Request() req: any, @Body('username') username: string) {
    return this.friendsService.sendFriendRequest(req.user.userId, username);
  }

  @Post('respond/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept or decline friend request' })
  async respond(@Request() req: any, @Param('id') id: string, @Body('accept') accept: boolean) {
    await this.friendsService.respondToRequest(req.user.userId, id, accept);
    return { status: 'SUCCESS', message: accept ? 'Friend request accepted' : 'Friend request declined' };
  }
}
