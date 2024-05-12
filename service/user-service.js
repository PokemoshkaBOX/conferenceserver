const ApiError = require("../error/ApiError");
const {User, user_info} = require("../models/models");

const bcrypt = require("bcrypt");
const uuid = require("uuid")
const mailService = require("./mail-service")
const TokenService = require("./token-service")
const UserDto = require("../dtos/user-dto")
const {TokenSchema} = require("../models/token-models");
class UserService{
    async registration(email, password, name, surname, patronymic, phone){
        const candidate = await User.findOne({where: {email: email}})
        if(candidate){
            throw ApiError.badRequest(`Пользователь с адресом ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const activationLink = uuid.v4();
        const role = "USER"
        const user = await User.create({email, password: hashPassword, activationLink, role})
        if(user) {
            console.log(user)
            await user_info.create({user_id: user.id, name, surname, patronymic, phone, userId: user.id})
            console.log(email)
            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/user/activate/${activationLink}`);
            console.log("Userdtu")
            const userDto = new UserDto(user);
            const tokens = TokenService.generateTokens({...userDto})
            if(tokens) {
                await TokenService.saveToken(userDto.id, tokens.refreshToken);
                console.log("User dto", userDto)
                return {
                    ...tokens,
                    user: userDto
                }
            }
        }

    }

    async activate(activationLink){
        const user = await User.findOne({where:{activationLink: activationLink}})
        if (!user){
            throw ApiError.badRequest('Неккоректная ссылка активации')
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password){
        const user = await User.findOne({where: {email: email}})
        if(!user){
            throw ApiError.badRequest('Пользователь с таким email не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if(!isPassEquals){
            throw ApiError.badRequest('Неверный пароль')
        }
        console.log(user.isActivated)
        if(user.isActivated === false){
            throw ApiError.badRequest('Почта не подтверждена')
        }
        const userDto = new UserDto(user);
        console.log("user", userDto)
        const tokens = TokenService.generateTokens({...userDto});

        await TokenService.saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto}
    }

    async logout(refreshToken){
        const token = await TokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.badRequest('Пользователь не авторизован')
        }
        const userData = TokenService.validateRefreshToken(refreshToken)
        const tokenFromDB = await TokenService.findToken(refreshToken)
        if(!userData || !tokenFromDB){
            throw ApiError.badRequest("Пользователь не авторизован")
        }
        const user = await User.findOne({where:{id: userData.id}})
        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({...userDto});

        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

}

module.exports = new UserService();