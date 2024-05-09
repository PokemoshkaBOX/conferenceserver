const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, Basket, user_infos, user_info, conferences, article, participants_user, participants} = require('../models/models')
const {validationResult} = require('express-validator')


const userService = require("../service/user-service")
const {Op} = require("sequelize");
const path = require("path");
const fs = require("fs");
class UserController{
    async registration(req, res, next){
        try{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.badRequest("Ошибка при валидации", errors.array()))
            }
            const {email, password, name, surname, patronymic} = req.body;
            console.log(email, password, name, surname, patronymic)
            const userData = await userService.registration(email, password, name, surname, patronymic);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
            return res.json(userData);
        }
        catch (e){
            next(e)
        }
    }

    async login(req, res,next) {
        try {
            const {email, password} = req.body
            const userData = await userService.login(email, password)
            console.log("userData", userData)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
            return res.json(userData);
        }
        catch (e){
            next(e)
        }
    }

    async logout(req, res, next){
        try{
            const {refreshToken} = req.cookies
            const token = await userService.logout(refreshToken)
            res.clearCookie('refreshToken')
            return res.json(token);
        }
        catch(e){
            next(e)
        }
    }
    async activate(req, res, next){
        try{
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        }
        catch(e){
            next(e)
        }
    }

    async refresh(req, res, next){
        try{
            const refreshToken = req.cookies.refreshToken;
            console.log(refreshToken)
            const userData = await userService.refresh(refreshToken)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
            console.log(userData)
            return res.json(userData);
        }
        catch(e){
            next(e)
        }
    }

    async getAllUser(req, res, next){
        const {email} = req.body
        console.log(req.body)
        const query = {}
        console.log("title", email)
        if (email){
            query.email = {[Op.substring]: email}
        }
        try {
            if(!email){
                let data = await User.findAndCountAll()
                console.log(data)
                return res.json(data)
            }
            else {
                let data = await User.findAndCountAll(
                    {where: query}
                )
                return res.json(data)
            }
        }catch (e){
            next(ApiError.badRequest(e.message))
        }
    }

    async userInfo(req, res, next){
        let {id} = req.query
        console.log(id)
        console.log("Ыыыыы", req.query)
        try{
            const user = await user_info.findOne({
                where: {user_id: id}
            })
            console.log(user)
            return res.json(user)
        }
        catch (e){
            next(e)
        }
    }

    async editUser(req, res, next){
        try {
            const { id, email, role } = req.query; // Предполагается, что у вас есть идентификатор конференции, который передается в запросе
            console.log(id, email, role)
            // Найдите конференцию по идентификатору
            const user = await User.findByPk(id);

            // Проверьте, найдена ли конференция
            if (!user) {
                return res.status(404).json({ message: "пользователь не найден" });
            }
            // Обновите данные конференции
            user.email = email;
            user.role = role;
            // Сохраните обновленные данные в базе данных
            await user.save();
            // Отправьте обновленную конференцию в ответе
            return res.json(user);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
    async conferenceUser(req, res, next){

        try {
        const { id } = req.query;

        // Найти участников конференции с ролью "докладчик"
        const conferenceParticipants = await participants.findAll({
            where: {
                conferenceId: id,
                role: 'докладчик'
            },
        });

        // Собрать массив идентификаторов участников
        const participantIds = conferenceParticipants.map(participant => participant.id);

        // Найти статьи, связанные с участниками конференции
        const conferenceArticles = await article.findAll({
            where: {
                participantId: participantIds
            }
        });
        console.log("conferenceArticles", conferenceArticles)

        return res.json(conferenceArticles);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }

    }
    async Role(req, res, next) {
        const{id, userId} = req.query
        console.log("id, params", req.query)
        try {
            const data1 = await participants.findAndCountAll({
                where: {
                    conferenceId: id,
                    userId: userId
                }
            })
            console.log(data1)
            return res.json(data1)
        }
        catch (e){
            next(ApiError.badRequest(e.message));
        }
    }

    async oneArticle(req, res, next) {
        try {
            const {userId, conferenceId} = req.query
            console.log("12345", req.query)
            console.log("participant1", userId, conferenceId)
            const participant1 = await participants.findOne({
                where:{
                    userId: userId,
                    conferenceId: conferenceId
                }
            })
            console.log("participant1",participant1)

            console.log("participant1",participant1.id)
            const article1 = await article.findOne({
                where:{
                    participantId: participant1.id
                }
            })
            console.log("article1", article1)
            return res.json(article1)
        } catch (e) {
            next(ApiError.badRequest(e.message)); // Обрабатываем возможные ошибки
        }
    }

    async AddArticle(req, res, next){
        try {
            const {conferenceId, userId} = req.body
            const {file} = req.files
            console.log(conferenceId, userId, file)
            const participant1 = await participants.findOne({
                where: {
                    userId: userId,
                    conferenceId: conferenceId
                }
            })
            console.log("participant1", participant1)

            console.log("participant1", participant1.id)
            const article1 = await article.findOne({
                where: {
                    participantId: participant1.id
                }
            })

            const uploadDir = path.join(__dirname, 'uploads');
            console.log(uploadDir)
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
            // Сохраняем файл на сервере
            const filePath = path.join(uploadDir, file.name);
            await file.mv(filePath);
            article1.file = filePath
            if(article1.proverki === 0) {
                article1.teacherstatus = 'Ожидает проверки'
                article1.proverki = article1.proverki + 1
            }
            else
                if(article1.proverki > 0)
                    article1.teacherstatus = 'Перепроверить'
            article1.save()
            console.log("filepath", filePath)
            return res.json(article1)
        }
        catch (e){
            next(ApiError.badRequest(e.message));
        }
    }

    async uploadTeacherArticle(req, res, next){
        try {
            const {authors} = req.body
            const {file} = req.files
            const article1 = await article.findOne({
                where: {
                    authors: authors
                }
            })

            const uploadDir = path.join(__dirname, 'uploads');
            console.log(uploadDir)
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
            // Сохраняем файл на сервере
            const filePath = path.join(uploadDir, file.name);
            await file.mv(filePath);
            article1.fileteacher = filePath
            article1.save()
            console.log("filepath", filePath)
            return res.json(article1)
        }
        catch (e){
            next(ApiError.badRequest(e.message));
        }
    }

    async GetOneUserInfo(req, res, next){
        try {
            const {id} = req.query
            console.log("да", req)
            const userInfo = await user_info.findOne({
                where: {
                    userId: id
                }
            })
            return res.json(userInfo)
        }
        catch (e){
            next(ApiError.badRequest(e.message));
        }
    }
}

module.exports = new UserController()