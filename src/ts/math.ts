class TypesetBotMath {
    private _tsb: TypesetBot;
    settings: TypesetBotSettings;

    constructor(tsb: TypesetBot) {
        this._tsb = tsb;
        this.settings = tsb.settings;
    }

    /**
     * Calculate adjustment ratio.
     *
     * @param idealW    The ideal line width
     * @param actualW   The current width of the line
     * @param wordCount The current word count on the line
     * @param shrink    The shrinkability of the word spacing
     * @param stretch   The stretchability of the word spacing
     * @returns         The adjustment ratio
     */
    getRatio = function(idealW: number, actualW: number, wordCount: number, shrink: number, stretch: number): number {
        if (actualW < idealW) {
            return (idealW - actualW) / ((wordCount - 1) * stretch);
        }

        return (idealW - actualW) / ((wordCount - 1) * shrink);
    }

    /**
     * Calculate the badness score.
     *
     * @param ratio The adjustment ratio
     * @returns     The badness
     */
    getBadness = function(ratio: number): number {
        if (ratio == null || ratio < this.settings.minRatio) {
            return Infinity;
        }

        return 100 * Math.pow(Math.abs(ratio), 3) + 0.5;
    }

    /**
     * Calculate the demerit.
     *
     * @param badness The badness
     * @param penalty The additional penalty to add
     * @param flag    Indicator if flag penalty shound be added
     * @returns       The line demerit
     */
    getDemeritFromBadness = function(badness: number, penalty: number, flag: boolean): number {
        const flagPenalty = flag ? this.settings.flagPenalty : 0;
        if (penalty >= 0) {
            return Math.pow(this.settings.demeritOffset + badness + penalty, 2) + flagPenalty;
        } else if (penalty === -Infinity) {
            return Math.pow(this.settings.demeritOffset + badness, 2) + flagPenalty;
        }

        return Math.pow(this.settings.demeritOffset + badness, 2) - Math.pow(penalty, 2) + flagPenalty;
    }

    /**
     * Get demerit from properties.
     *
     * @param ratio                The adjustment ratio
     * @param flag                 Does the linebreak have a penalty flag
     * @param hasHyphen            Does the line have a hyphen
     * @param skippingFitnessClass Does the line skip more than one fitness class
     * @returns                    The demerit
     */
    getDemerit = function(ratio: number, flag: boolean, hasHyphen: boolean, skippingFitnessClass: boolean): number {
        const badness = this.getBadness(ratio);
        let additionalPenalty = 0;
        if (hasHyphen) {
            if (this.settings.alignment === 'justify') {
                additionalPenalty += this.settings.hyphenPenalty;
            } else { // Left, right, center
                additionalPenalty += this.settings.hyphenPenaltyRagged;
            }
        }

        let demerit = this.getDemeritFromBadness(badness, additionalPenalty, flag);
        if (skippingFitnessClass) {
            demerit += this.settings.fitnessClassDemerit;
        }

        return demerit;
    }

    /**
     * Get fitness class from adjustment ratio.
     *
     * @param   ratio The adjustment ratio
     * @returns       The fitness class
     */
    getFitnessClass = function(ratio: number): number {
        for (const fitnessClass of this.settings.fitnessClasses) {
            if (ratio < fitnessClass) {
                return fitnessClass;
            }
        }

        return this.settings.fitnessClasses[this.settings.fitnessClasses.length - 1]; // Default for infinite ratio
    }

    /**
     * Check if adjustment ratio is within a valid range.
     *
     * @param   ratio     The adjustment ratio
     * @param   looseness The loosness to add the maximum allowed adjustment ratio
     * @returns           Return true if ratio is valid for breakpoint, otherwise false
     */
    isValidRatio = function(ratio: number, looseness: number): boolean {
        return this.ratioIsLessThanMax(ratio, looseness) && this.ratioIsHigherThanMin(ratio);
    }

    /**
     * Check if ratio is less or equal to allowed maximum ratio.
     *
     * @param   ratio     The adjustment ratio
     * @param   looseness The loosness to add the maximum allowed adjustment ratio
     * @returns           Return true if ratio is less than max. ratio
     */
    ratioIsLessThanMax = function(ratio: number, looseness: number): boolean {
        return ratio <= (this.settings.maxRatio + looseness);
    }

    /**
     * Check if ratio is higher or equal to allowed minimum ratio.
     *
     * @param   ratio The adjustment ratio
     * @returns       Return true if ratio is higher than min. ratio
     */
    ratioIsHigherThanMin = function(ratio: number): boolean {
        return ratio >= this.settings.minRatio;
    }
}
