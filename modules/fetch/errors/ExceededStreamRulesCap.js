class ExceededStreamRulesCap extends Error {
    /**
     * Eccezione per segnalare che è stato raggiunto il numero massimo di regole attive
     */
    constructor(message="Non è possibile aggiungere ulteriori regole") {
        super(message);
        this.name = "ExceededStreamRulesCap";
    }
}

module.exports = ExceededStreamRulesCap;