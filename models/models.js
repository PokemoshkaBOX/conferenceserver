const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user',{
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    isActivated: {type: DataTypes.STRING, defaultValue: false},
    activationLink: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: "USER"},
})

const user_info = sequelize.define('user_info',{
    user_id: {type: DataTypes.INTEGER, ref: 'User'},
    name: {type: DataTypes.STRING, allowNull: false},
    surname: {type: DataTypes.STRING, allowNull: false},
    patronymic: {type: DataTypes.STRING, allowNull: false},
    phone: {type: DataTypes.STRING, allowNull: true},
})

const conferences = sequelize.define('conferences',{
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, unique: true},
    date_begin: {type: DataTypes.DATE, allowNull: false},
    date_end: {type: DataTypes.DATE, allowNull: false},
    info: {type: DataTypes.TEXT, allowNull: true},
    infoarea: {type: DataTypes.TEXT, allowNull: true},
    infoplan: {type: DataTypes.TEXT, allowNull: true},
    infoprog: {type: DataTypes.TEXT, allowNull: true},
    infosections: {type: DataTypes.TEXT, allowNull: true},
    infopurposes: {type: DataTypes.TEXT, allowNull: true}
})
const participants = sequelize.define('participants',{
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    role: {type: DataTypes.STRING, allowNull: false},
    status:  {type: DataTypes.STRING, allowNull: true},
})

const participants_user = sequelize.define('participants_user',{
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
} )

const article = sequelize.define('article', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    article_name: {type: DataTypes.STRING, allowNull: true},
    authors: {type: DataTypes.STRING, allowNull: true},
    section: {type: DataTypes.STRING, allowNull: true},
    teacher: {type: DataTypes.STRING, allowNull: true},
    teacherstatus: {type: DataTypes.STRING, allowNull: true},
    proverki: {type: DataTypes.STRING, allowNull: true},
    pages: {type: DataTypes.STRING, allowNull: true},
    annotation: {type: DataTypes.STRING, allowNull: true},
    institution: {type: DataTypes.STRING, allowNull: false},
    status: {type: DataTypes.STRING, allowNull: false},
    article_word: {type: DataTypes.STRING, allowNull: true},
    file: {type: DataTypes.STRING, allowNull: true},
    fileteacher: {type: DataTypes.STRING, allowNull: true},
})

User.hasOne(user_info)
user_info.belongsTo(User)

User.hasOne(participants_user)
participants_user.belongsTo(User)

User.hasMany(participants)
participants.belongsTo(User)

participants.hasMany(participants_user)
participants_user.belongsTo(User)

conferences.hasMany(participants)
participants.belongsTo(conferences)

participants.hasMany(article)
article.belongsTo(participants)

module.exports = {
    User,
    user_info,
    conferences,
    participants,
    participants_user,
    article
}