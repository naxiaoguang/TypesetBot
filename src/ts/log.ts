/**
 * Class for handling debug messages and performance logging.
 */
class TypesetBotLog {

    debug: boolean = true;
    private _tsb: TypesetBot;
    private _performanceMap: { [key: string] : TypesetBotPerformanceEntry; };

    /**
     * The constructor.
     *
     * @param tsb Instance of main class
     */
    constructor(tsb: TypesetBot) {
        this._tsb = tsb;
        this._performanceMap = {};
    }

    /**
     * Log messages if debug mode is on.
     *
     * @param message The log message
     */
    log = function(message: any) {
        if (this.debug) {
            console.log('TypesetBot: %s', message);
            if (typeof message === 'object') {
                console.log(message);
            }
        }
    }

    /**
     * Log messages if debug mode is on.
     *
     * @param message The log message
     */
    warn = function(message: any) {
        if (this.debug) {
            console.warn('TypesetBot: %s', message);
            if (typeof message === 'object') {
                console.warn(message);
            }
        }
    }

    /**
     * Log messages if debug mode is on or off.
     *
     * @param message The log message
     */
    error = function(message: any) {
        console.error('TypesetBot: %s', message)
        if (typeof message === 'object') {
            console.error(message);
        }
    }

    /**
     * Start performance capture on specific key.
     *
     * @param key
     */
    start = function(key: string) {
        if (!this.debug) {
            return;
        }

        if (!(key in this._performanceMap)) {
            this._performanceMap[key] = new TypesetBotPerformanceEntry();
        }
        this._performanceMap[key].start.push(performance.now());
    }

    /**
     * End performance capture on specific key.
     *
     * @param key
     */
    end = function(key: string) {
        if (!this.debug) {
            return;
        }

        if (!(key in this._performanceMap)) {
            this._performanceMap[key] = new TypesetBotPerformanceEntry();
        }
        this._performanceMap[key].end.push(performance.now());
    }

    /**
     * Get formatted string of total performance time of specific key.
     *
     * @param key
     *
     * @returns Formatted string in ms and number of calls.
     */
    diff = function(key: string): string {
        let startTotal: number = 0;
        let endTotal: number = 0;
        const entry: TypesetBotPerformanceEntry = this._performanceMap[key];

        for (let i = 0; i < entry.start.length; i++) {
            startTotal += entry.start[i];
            endTotal += entry.end[i];
        }
        // Substract combined timestamps and round to 2 decimal.
        return (endTotal - startTotal).toFixed(2) + 'ms --- (calls: ' + entry.start.length + ')';
    }
}

/**
 * Class to hold start and end timestamps for a specific key.
 */
class TypesetBotPerformanceEntry {
    start: number[];
    end: number[];
    constructor() {
        this.start = [];
        this.end = [];
    }
}
