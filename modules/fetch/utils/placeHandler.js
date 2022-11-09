module.exports = {
    _placeHandler : _placeHandler
}

/**
 * Cerca e restituisce le informazioni della posizione di un tweet
 * @param {Object[]} places                     Array di tutte le posizioni incluse in tutti i tweet
 * @param {Object} tweet                        Tweet corrente di cui si vuole trovare la posizione
 * @returns {{id: string, full_name: string, country: string, coords: {long: number, lat: number}}}  
 *          Oggetto contentente informazioni sulla posizione del tweet:
 *          ID del luogo, nome del luogo, paese, e coordinate aventi longitudine e latitudine
 */
function _placeHandler(places, tweet) {
    const plc = places.find(plc => plc.id === tweet.geo.place_id);

    // Le API di twitter non forniscono una posizione precisa sul tweet ma due posizioni che delimitano un'area approssimativa,
    // si fa quindi la media e si prende il centro di quest'area
    const long = (plc.geo.bbox[0] + plc.geo.bbox[2]) / 2;
    const lat = (plc.geo.bbox[1] + plc.geo.bbox[3]) / 2;
    
    const place = { id: plc.id, full_name: plc.full_name, country: plc.country, coords: { long: long, lat: lat } };
    return place;
}