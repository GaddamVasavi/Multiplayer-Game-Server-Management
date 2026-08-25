import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new player account' })
  @ApiResponse({ status: 201, description: 'User successfully registered and authenticated.' })
  @ApiResponse({ status: 409, description: 'Username or Email already registered.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Player login' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated player profile' })
  @ApiResponse({ status: 200, description: 'Current profile data returned.' })
  async getProfile(@Request() req: any) {
    const user = await this.authService.validateUserById(req.user.userId);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.profile ? user.profile.displayName : user.username,
      eloRating: user.profile ? user.profile.eloRating : 1200,
      matchesPlayed: user.profile ? user.profile.matchesPlayed : 0,
      wins: user.profile ? user.profile.wins : 0,
      losses: user.profile ? user.profile.losses : 0,
      totalScore: user.profile ? user.profile.totalScore : 0,
      avatarUrl: user.profile ? user.profile.avatarUrl : null,
      isOnline: user.profile ? user.profile.isOnline : true,
    };
  }
}
