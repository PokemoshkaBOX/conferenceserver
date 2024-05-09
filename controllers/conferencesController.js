const uuid = require('uuid')
const path = require('path')
const {conferences, participants_user, article, participants} = require('../models/models')
const ApiError = require('../error/ApiError')
const {Op, where} = require("sequelize");
const fs = require('fs');
class ConferencesController{
    async getConferences(req, res, next){
        console.log("sssssssssss")
        const {title} = req.query
        console.log(req.query)
        const query = {}
        console.log("title", title)
        if (title){
            query.title = {[Op.substring]: title}
        }
        try {
            if(!title){
                let data = await conferences.findAndCountAll()
                console.log(data)
                return res.json(data)
            }
            else {
                let data = await conferences.findAndCountAll(
                    {where: query}
                )
                return res.json(data)
            }
        }catch (e){
            next(ApiError.badRequest(e.message))
        }
    }
    async getOne(req, res, next){
        try {
            const {id} = req.params
            console.log("id", id)
            const data = await conferences.findOne(
                {
                    where: {id},
                },
            )
            console.log(data)
            return res.json(data)
        } catch (e){
            next(ApiError.badRequest(e.message))
        }
    }

    async getUserConferences(req, res, next) {

        const {id} = req.query
        console.log(id)
        try {
            const userData = await participants.findAll({
                where: { userId: id }, // Замените 1 на идентификатор пользователя, если вы хотите получить конференции для другого пользователя
            })
            // Извлечение всех значений id из userData
            const userIds = userData.map(user => user.conferenceId);
            // Находим все конференции, в которых участвует данный пользователь
            if(userIds) {
                const conferences1 = await conferences.findAndCountAll({
                    where: {id: userIds},
                });
                return res.json(conferences1);
            }
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
    async createConference(req, res, next){
        try {
            let {title, date_begin, date_end, info, infoarea, infoplan, infoprog, infosections, infopurposes} = req.body
            console.log(date_begin, date_end,)
            const conference = await conferences.create({title, date_begin, date_end, info, infoarea, infoplan, infoprog, infosections, infopurposes})
            return res.json(conference)
        } catch (e){
            next(ApiError.badRequest(e.message))
        }
    }

    async updateConference(req, res, next) {
        try {
            const { id } = req.body; // Предполагается, что у вас есть идентификатор конференции, который передается в запросе
            const { title, date_begin, date_end, info } = req.body;

            // Найдите конференцию по идентификатору
            const conference = await conferences.findByPk(id);

            // Проверьте, найдена ли конференция
            if (!conference) {
                return res.status(404).json({ message: "Конференция не найдена" });
            }
            // Обновите данные конференции
            conference.title = title;
            conference.date_begin = date_begin;
            conference.date_end = date_end;
            conference.info = info;
            // Сохраните обновленные данные в базе данных
            await conference.save();

            // Отправьте обновленную конференцию в ответе
            return res.json(conference);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async deleteConference(req, res, next) {
        try {
            const {id} = req.body.params
            const conference = await conferences.findByPk(id); // Находим конференцию в базе данных по идентификатору

            // Проверяем, найдена ли конференция
            if (!conference) {
                return res.status(404).json({ message: "Конференция не найдена" });
            }

            // Удаляем конференцию из базы данных
            await conference.destroy();

            // Отправляем ответ об успешном удалении
            return res.json({ message: "Конференция успешно удалена" });
        } catch (e) {
            next(ApiError.badRequest(e.message)); // Обрабатываем возможные ошибки
        }
    }

    async addArticle(req, res, next) {
        try {
            const {id_conf, user_id, role, section, teacher, email, title, annotation, inst} = req.body;

            if (role === "докладчик"){
                const {file} = req.files;
                console.log(id_conf, user_id, section, teacher, role, email, title, annotation, inst, file)
                // Проверяем, что файл существует и имеет расширение .docx или .pdf
                if (!file || !['.docx', '.pdf'].includes(path.extname(file.name).toLowerCase())) {
                    throw new Error('Неверный формат файла. Поддерживаются только файлы .docx и .pdf.');
                }

                // Сохраняем файл на сервере или в облачном хранилище
                const uploadDir = path.join(__dirname, 'uploads');
                console.log(uploadDir)
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir);
                }
                // Сохраняем файл на сервере
                const filePath = path.join(uploadDir, file.name);
                await file.mv(filePath);
                console.log("filepath", filePath)
                const participant = await participants.create({role, conferenceId: id_conf, userId: user_id})
                console.log("participants", participant)
                const participant_user = await participants_user.create({
                    userId: user_id,
                    participantId: participant.id
                })
                console.log(participants_user)
                console.log("participant_user", participant_user)
                const conference = await article.create({
                    article_name: title,
                    authors: email,
                    section: section,
                    teacher: teacher,
                    pages: "80",
                    annotation,
                    teacherstatus: "Проверить",
                    proverki: 0,
                    institution: inst,
                    file: filePath,
                    status: "Новое",
                    article_word: "8000",
                    participantId: participant.id
                });
                console.log("conference", conference)
                return res.json(conference)
            }
            else
            {
                const participant = await participants.create({role, conferenceId: id_conf, userId: user_id})
                return res.json(participants)
            }
            // Отправляем ответ об успешном добавлении статьи

        } catch (e) {
            next(ApiError.badRequest(e.message)); // Обрабатываем возможные ошибки
        }
    }

    async getOneParticipant(req, res, next) {
        const {id} = req.params
        const participant = await participants.findAll({
            where: {
                conferenceId: id
            }
        })
        return res.json(participant)
    }

    async updateUserStatus(req, res, next) {
        const {selectedParticipantId, selectedStatus} = req.body.params
        console.log("dqwd", req.body.params)
        const participant = await participants.findOne({
            where: {
                id: selectedParticipantId
            }
        })
        console.log(participant)
        participant.status = selectedStatus
        participant.save()

        return res.json(participant)
    }
}

module.exports = new ConferencesController()