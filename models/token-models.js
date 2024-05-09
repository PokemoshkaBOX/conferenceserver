const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const TokenSchema = sequelize.define('tokenshema',{
    user: {type: DataTypes.INTEGER, ref: 'User'},
    refreshToken: {type: DataTypes.STRING},
})

module.exports = {
    TokenSchema
}