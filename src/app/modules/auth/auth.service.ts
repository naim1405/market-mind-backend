import httpStatus from '../../../const/httpStatus';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { type Request } from 'express';
import { getDeviceInfo } from '../../../helpers/getDeviceInfo';
import { createPrismaToken } from '../../../helpers/createPrismaToken';
import { bcryptUtils } from '../../../helpers/bcrypt';
import type { IChangePassword, ILoginUser } from './auth.interface';
import { prisma } from '../../../lib/prisma';
import { UserStatus } from '../../../generated/prisma/enums';
import type { JWTPayload } from '../../../interface';

const loginUser = async (req: Request) => {
    const payload: ILoginUser = req.body;

    const { device, ip } = getDeviceInfo(req);

    const { email, password } = payload;

    const user = await prisma.user.findUnique({
        where: {
            email,
            status: UserStatus.ACTIVE,
        },
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
    }

    const isPasswordMatch =
        user.password &&
        (await bcryptUtils.comparePasswords(password, user.password));

    if (!isPasswordMatch) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
    }

    const JwtPayload = {
        userId: user.id,
        role: user.role,
        phone: user.phone,
        email: user.email,
    };

    const token = await jwtHelpers.generateTokenPair(JwtPayload);

    await prisma.activeToken.deleteMany({
        where: {
            userId: user.id,
        },
    });

    await createPrismaToken({
        id: user.id,
        tokenId: token.tokenId,
        ip,
        device,
    });

    return {
        access: token.accessToken,
        refresh: token.refreshToken,
        user: {
            id: user.id,
            email: user.email,
        },
    };
};

const changePassword = async (req: Request) => {
    const user = req.user as JWTPayload;
    const payload: IChangePassword = req.body;

    const isUserExists = await prisma.user.findUniqueOrThrow({
        where: {
            id: user.userId,
            status: 'ACTIVE',
        },
    });

    const isPasswordMatch =
        isUserExists.password &&
        (await bcryptUtils.comparePasswords(
            payload.oldPassword,
            isUserExists.password
        ));

    if (!isPasswordMatch) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
    }

    const hashPassword = await bcryptUtils.hashedPassword(payload.newPassword);

    const result = await prisma.user.update({
        where: {
            id: user.userId,
        },
        data: {
            password: hashPassword,
        },
    });

    return result;
};

const getMe = async (user: JWTPayload) => {
    const { userId } = user;

    const result = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
            status: 'ACTIVE',
        },
        select: {
            id: true,
            phone: true,
            email: true,
            role: true,
        },
    });

    return {
        id: result.id,
        phone: result.phone,
        email: result.email,
        role: result.role,
    };
};

const logout = async (req: Request) => {
    const user = req.user as JWTPayload;

    const activeTokens = await prisma.activeToken.findMany({
        where: {
            userId: user.userId,
        },
    });

    activeTokens.forEach(async (t) => {
        await prisma.activeToken.delete({ where: { id: t.id } });
    });
};

const handleFacebookCallback = async (req: Request, code: string) => {
    const codeVerification = await facebookClient.verifyCode(code);

    const { access_token } = codeVerification;
    const user = await facebookClient.getMe(access_token);
    const { id: userId, accounts: { data: accounts } = { data: [] } } = user;

    //NOTE: name and email are optional. maybe add custom prompt for these info?
    let { name = userId, email = userId } = user as any;

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.upsert({
            where: {
                email,
            },
            update: {
                facebookId: userId,
                facebookToken: access_token,
            },
            create: {
                email,
                name,
                role: 'USER',
                facebookId: userId,
                facebookToken: access_token,
            },
        });
        await Promise.all(
            accounts.map(async (account) => {
                await tx.tenant.upsert({
                    where: {
                        pageId: account.id,
                    },
                    update: {
                        name: account.name,
                        facebookAccessToken: account.access_token,
                    },
                    create: {
                        name: account.name,
                        pageId: account.id,
                        facebookAccessToken: account.access_token,
                        user: {
                            connect: {
                                id: user.id,
                            },
                        },
                    },
                });
            })
        );
        return user;
    });

    const JwtPayload = {
        userId: result.id,
        role: result.role,
        email: result.email,
    };

    const token = await jwtHelpers.generateTokenPair(JwtPayload);

    await prisma.activeToken.deleteMany({
        where: {
            userId: result.id,
        },
    });
    const { device, ip } = getDeviceInfo(req);

    await createPrismaToken({
        id: result.id,
        tokenId: token.tokenId,
        ip,
        device,
    });

    return {
        access: token.accessToken,
        refresh: token.refreshToken,
    };
};
export const AuthService = {
    loginUser,
    changePassword,
    getMe,
    logout,
    handleFacebookCallback,
};
