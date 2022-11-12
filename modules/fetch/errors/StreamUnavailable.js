class StreamUnavailable extends Error {
    /**
     * Eccezione per segnalare che è stato raggiunto il numero massimo di regole attive
     */
    constructor(message="Non è possibile connettersi allo stream") {
        super(message);
        this.name = "StreamUnavailable";
    }
}

module.exports = StreamUnavailable;