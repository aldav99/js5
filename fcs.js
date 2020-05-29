function makeTime(hours, minutes) {
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.getTime();
}

/**
 * @type {Object<string, Flight>} Список всех рейсов
 */
let flights = {
    BH118: {
        name: 'BH118',
        seats: 28,
        businessSeats: 4,
        registrationStarts: makeTime(10, 0),
        registartionEnds: makeTime(15, 0),
        tickets: [
            {
                id: 'BH118-B50',
                flight: 'BH118',
                fullName: 'Ivanov I. I.',
                type: 0,
                seat: 18,
                buyTime: makeTime(2, 0),
                registrationTime: null,
            }
        ],
    },
    BH119: {
        name: 'BH119',
        seats: 1,
        businessSeats: 0,
        registrationStarts: makeTime(10, 0),
        registartionEnds: makeTime(15, 0),
        tickets: [
            {
                id: 'BH119-150',
                flight: 'BH119',
                fullName: 'Sidorov S. S.',
                type: 0,
                seat: 1,
                buyTime: makeTime(2, 0),
                registrationTime: null,
            }
        ],
    }
};

/**
 * Добавление рейса
 * 
 * * назначение номера рейса
 * * подготовка рейса
 *   * вычисление времени регистрации
 *   * подготовка структуры Flight
 * 
 * @param {Airliner} airliner Информация о самолете
 * @param {number} time Время вылета
 * @returns {Flight}
 */
// function createFlight(airliner, time) { }

/**
 * Поиск свободного места нужного типа
 * 
 * Гарантирует что найдет свободное место нужного типа или вернет null
 * 
 * @param {Flight} flight 
 * @param {number} type
 * @returns {number} seat
 */
function findAvailableSeat(flight, type) {
    let exists;
    let seat;
    let seatsOfType = 0;

    switch (type) {
        case 0: // standart
            const availableSeats = [];

            for (let i = flight.businessSeats + 1; i <= flight.seats; i++)
                if (!flight.tickets.find(item => item.seat === i))
                    availableSeats.push(i)

            if (availableSeats.length === 0)
                return null;

            const index = Math.floor(Math.random() * availableSeats.length);
            return availableSeats[index];
        case 1: // business
            for (let i = 1; i <= flight.businessSeats; i++)
                if (!flight.tickets.find(item => item.seat === i))
                    seatsOfType++;

            if (seatsOfType === 0)
                return null;

            do {
                seat = Math.floor(Math.random() * flight.businessSeats) + 1;
                exists = flight.tickets.find(item => item.seat === seat);
            } while (exists);

            return seat;
        default:
            throw new Error(`Unknown type`)
    }
}

/**
 * Покупка билета на самолет
 * 
 * * проверка рейса
 * * проверка возможности купить (время и наличие мест)
 * * сохранение данных билета в информации о рейсе
 * 
 * @param {string} flightName Номер рейса
 * @param {number} buyTime Время покупки
 * @param {string} fullName Имя пассажира
 * @param {number} type Тип места
 * @returns {Ticket} Возвращаем копию билета
 */
function buyTicket(flightName, buyTime, fullName, type = 0) {
    const flight = flights[flightName];

    if (!flight)
        throw new Error('Flight not found');

    if (flight.tickets.length >= flight.seats)
        throw new Error('No seats available');

    if (buyTime > flight.registartionEnds)
        throw new Error('Time away');

    const seat = findAvailableSeat(flight, type);
    if (!seat)
        throw new Error(`No seats of type ${type} available. You can choose another type`);

    let id;
    do {
        id = flight.name + '-' + Math.random().toString().substr(2, 3);
        exists = flight.tickets.find(item => item.id === id);
    } while (exists);

    /**
     * @type {Ticket}
     */
    const ticket = {
        id,
        flight: flight.name,
        buyTime,
        fullName,
        registrationTime: null,
        type,
        seat,
    }

    flight.tickets.push(ticket);

    // return Object.assign({}, ticket);
    return {
        ...ticket,
        welcome: 'Nice to choose us',
    };
}

const a = buyTicket('BH118', makeTime(5, 10), 'Petrov I. I.');
console.log(a);


function displayFlights() {
    console.log('*** List of all flights ***');
    console.table(flights);
}

function flightDetails(flightName) {
    console.log(`*** Details of flight ${flightName} ***`);
    const flight = flights[flightName];
    if (!flight) {
        console.warn('Flight not found');
        return;
    }

    console.table(flight);
    console.table(flight.tickets);
}

/**
 * Функция пробует произвести электронную регистрацию пассажира
 *
 *  * проверка билета
 *  * проверка данных пассажира
 *  * электронную регистрацию можно произвести только в период от 5 до 1 часа до полета
 *
 * @param {string} ticket номер билета
 * @param {string} fullName имя пассажира
 * @param {number} nowTime текущее время
 * @returns boolean успешна ли регистрация
 */
function eRegistration(ticket, fullName, nowTime) {
    const regexp = /^(\w{5})-\w{3}$/;

    let test = ticket.match(regexp);
    if (!test)
        throw new Error('Unknown format of ticket');

    let flightName = test[1];
    let flight = flights[flightName];

    if (!flight)
        throw new Error('Flight not found');


    let ticketInfo = flight.tickets.find(item => item.id === ticket);

    if (!ticketInfo)
        throw new Error('Ticket not found');

    if (ticketInfo.fullName !== fullName)
        throw new Error('Ticket not for this person');

    let regTime = formatTime(nowTime);

    if (regTime < flight.registrationStarts || regTime > flight.registartionEnds)
        throw new Error('Bad time of registration');

    ticketInfo.registrationTime = regTime;

    return true;
}

/**
 * Отчет о рейсе на данный момент
 * 
 * @typedef { Object } Report
 * @property { string } flight Номер рейса
 * @property { boolean } registration Доступна регистрация на самолет
 * @property { boolean } complete Регистрация завершена или самолет улетел
 * @property { number } countOfSeats Общее количество мест
 * @property { number } reservedSeats Количество купленных(забронированных) мест
 * @property { number } registeredSeats Количество пассажиров, прошедших регистрацию
 * /

/**
* Функция генерации отчета по рейсу
* 
*  * проверка рейса
*  * подсчет
* 
* @param {string} flight номер рейса
* @param {number} nowTime текущее время
* @returns {Report} отчет
*/
function flightReport(flight, nowTime) {
    let registration;
    let complete;

    let countOfSeats = flight.seats;
    let reservedSeats = flight.tickets.filter(item => item.buyTime).length;
    let registeredSeats = flight.tickets.filter(item => item.registrationTime).length;

    let regTime = formatTime(nowTime);

    function periodOfRegistration() {
        if (regTime >= flight.registrationStarts && regTime <= flight.registartionEnds) {
            return true;
        } else {
            return false;
        }
    }

    if (periodOfRegistration() && (countOfSeats > registeredSeats)) {
        registration = true;
    } else {
        registration = false;
    }


    complete =
        ((registeredSeats == countOfSeats) || (regTime > flight.registartionEnds));

    return {
        flight: flight.name,
        registration: registration,
        complete: complete,
        countOfSeats: countOfSeats,
        reservedSeats: reservedSeats,
        registeredSeats: registeredSeats,
    }

}
function formatTime(nowTime) {
    let hoursRegistration = nowTime.getHours();
    let minutesRegistration = nowTime.getMinutes();
    return makeTime(hoursRegistration, minutesRegistration);
}

function flightDetails(flightName) {
    let elem = document.getElementById('flight-details');

    if (!flightName) {
        return elem.innerText = "This flight not found";
    }

    let currentTime = new Date();

    let registrationStarts = flightName.registrationStarts;
    let registartionEnds = flightName.registartionEnds;


    let resultStrFlight = `Flight: ${flightName.name} \n Seats: ${flightName.seats} \n BusinessSeats: ${flightName.businessSeats} \n registrationStarts: ${registrationStarts} \n registartionEnds: ${registartionEnds} \n TicketsInfo: \n`

    let tickets = flightName.tickets;

    elem.innerText = resultStrFlight + resultStrTickets(tickets);
}

function ticketToStr(ticket) {
    return `№ ticket: ${ticket.id} \n Seat: ${ticket.seat} \n fullName: ${ticket.fullName} \n Registration: ${(ticket.registrationTime != null)} \n`
}


function resultStrTickets(tickets) {
    let result = "";
    for (let ticket of tickets) {
        result = result + '\n' + ticketToStr(ticket);
    }
    return result;
}


function report() {
    let flightName = document.getElementById('flight').value;
    let flight = flights[flightName];
    flightDetails(flight);
}



