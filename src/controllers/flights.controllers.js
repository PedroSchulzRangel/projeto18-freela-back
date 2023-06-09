import { searchForCity,
    searchForAirlineById,
    insertFlightIntoDB,
    searchForFlight,
    searchForFilteredFlights,
    searchForFlightById,
    searchForFlightDetails,
    searchForDepartureCity} from "../repository/flights.repository.js";

export async function insertFlights(req, res){
    const {id_city_dep,
        id_city_arr,
        id_airline,
        departure,
        arrival,
        price} = req.body;

    try{
        const cityDep = await searchForCity(id_city_dep);

        const cityArr = await searchForCity(id_city_arr);

        if(cityDep.rowCount === 0 || cityArr.rowCount === 0) return res.status(400).send("id da cidade de origem ou destino inválido");

        const airline = await searchForAirlineById(id_airline);

        if(airline.rowCount === 0) return res.status(400).send("id da linha aérea não existe");

        if(departure >= arrival) return res.status(400).send("datas e horários inválidos");

        insertFlightIntoDB(id_city_dep,
            id_city_arr,
            id_airline,
            departure,
            arrival,
            price);

        res.sendStatus(201);

    } catch (error){
        res.status(500).send(error.message);
    }
}

export async function getFlightsByCityId (req, res) {
    
    const {id} = req.params;
    const precoMinimo = parseInt(req.query.precoMinimo);
    const precoMaximo = parseInt(req.query.precoMaximo);
    let flights;

    try{
        const city = searchForCity(id);

        if(city.rowCount === 0) return res.status(404).send("Esta cidade não existe");


        if(req.query.precoMinimo === undefined && req.query.precoMaximo === undefined){
            flights = await searchForFlight(id);
        } else {
            flights = await searchForFilteredFlights(id, precoMinimo, precoMaximo);
        }

        res.status(200).send(flights.rows);

    } catch (error){
        res.status(500).send(error.message);
    }
}

export async function getFlightsById (req, res) {
    
    const {id} = req.params;

    try{
        const flight = await searchForFlightById(id);

        if(flight.rowCount === 0) return res.status(404).send("o voo buscado não existe");

        const flightDetails = await searchForFlightDetails(id);

        const cityOfDeparture = await searchForDepartureCity(id);

        const body = {
            flightDetails: flightDetails.rows[0],
            cityOfDeparture: cityOfDeparture.rows[0]
        }

        res.status(200).send(body);

    } catch (error){
        res.status(500).send(error.message);
    }
}