class ApiError extends  Error{
    constructor(status, message, error) {
        super(); // вызываем родительский контрллер
        this.status = status // присваиваем то что получаем параметрами
        this.message = message
    }

    static badRequest(message){ //функция под разные статус коды для вывода ошибок на сервере
        return new ApiError(404, message)
    }

    static internal(message){
        return new ApiError(500, message)
    }

    static forbidden(message){
        return new ApiError(403, message)
    }
}

module.exports = ApiError