window.addEventListener("load", (event) => {

    const grossSalaryElement = document.querySelector('#grossSalary'); 
    const submitButton = document.querySelector('#submitBtn');

    /*
        Event listener for when the user hits the enter key in the text input. 
        Calls the standard handler method, handler. 
    */
    grossSalaryElement.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            handler(event); 
        }
    });

    /*
        Event listener for when the user clicks the Calculate Taxes button. 
        Calls the standard handler method, handler. 
    */
    submitButton.addEventListener("click", (event) => {
        handler(event); 
    });

    /*
    A standardized handler method. This is called from inside event listeners
    so different event listeners that represent submission of the "form" are
    able to use the same code. 
    */ 
    const handler = (event) => {

        // if the chart is already being output, clear it
        chartSection.innerHTML = ""; 

        // Pull the grossSalary from the text input
        let grossSalary = grossSalaryElement.value;

        // calculate the raw amount for all tax brackets 
        let fedTaxes = calculateFederalTaxes(grossSalary);  
        let stateTaxes = calculateStateTaxes(grossSalary); 
        let medicareTaxes = calculateMedicareTaxes(grossSalary); 
        let ssnTaxes = calculateSocialSecurityTax(grossSalary); 
        let totalTaxes = (fedTaxes + stateTaxes + medicareTaxes + ssnTaxes); 
        let netPay = grossSalary - totalTaxes; 

        // format and display taxes with parseFloat and toFixed
        fedTaxes = parseFloat(fedTaxes.toFixed(2)); 
        stateTaxes = parseFloat(stateTaxes.toFixed(2));
        medicareTaxes = parseFloat(medicareTaxes.toFixed(2));
        ssnTaxes = parseFloat(ssnTaxes.toFixed(2));
        totalTaxes = parseFloat(totalTaxes.toFixed(2));
        netPay = parseFloat(netPay.toFixed(2));

        // Clear out the previously calculated salary 
        grossSalaryElement.value = ""; 

        // Create the chart itself and then append it 
        let chart = document.createElement("table"); 
        chart.innerHTML = 
                `<tr><th>Gross Pay</th><td>${formatString(grossSalary)}</td></tr>`
                + `<tr><th>Federal Taxes</th><td>${formatString(fedTaxes)}</td></tr>`
                + `<tr><th>State Taxes</th><td>${formatString(stateTaxes)}</td></tr>`
                + `<tr><th>Medicare Taxes</th><td>${formatString(medicareTaxes)}</td></tr>`
                + `<tr><th>SSN Taxes</th><td>${formatString(ssnTaxes)}</td></tr>`
                + `<tr><th>Total Taxes</th><td>${formatString(totalTaxes)}</td></tr>`
                + `<tr><th>Net Pay</th><td>${formatString(netPay)}</td></tr>`
        ;
        chart.id = "taxChart"; 

        chartSection.appendChild(chart); 

    }

    /*
        Formats strings with decimals so they have right-padded zeroes. 
        For example: if amount = 12, this will return 12.00. If amount = 12.2, 
        then this will return 12.20. 
    */
    const formatString = (amount) => {
        // TODO
        // fedTaxes = parseFloat(fedTaxes.toFixed(2)); 
        //let amountString = parseFloat(amount.toFixed(2));  
        let amountString = "$" + amount.toString(); 
        let decimalIndex = amountString.indexOf('.'); 

        // The following code creates a new substring of the necessary amount
        // of 0s needed to pad the end of the money string, if any.  
        let paddedZeroes = ""; 

        if (decimalIndex == -1) {
            // there is no decimal, ex: "140"
            // Note that numbers like 140.00 (all 0s after decimal) will remove 0s
            paddedZeroes = ".00"; 
        } else {
            // determine how many digits follow the decimal and pad if 1
            let digitsAfterDecimal = amountString.substring(decimalIndex + 1, amountString.length).length; 
            paddedZeroes = (digitsAfterDecimal === 1) ? + "0" : ""; 
        }

        return amountString + paddedZeroes; 

    }

    /*
        A standardized, generalized way to calculate brackets that uses
        tax brackets with any number of brackets. 
    */
    const bracketCalculations = (taxBrackets, grossSalary) => {

        const NUM_BRACKETS = taxBrackets.length;
        let salaryRemaining = grossSalary; // used for calculations in reduce

        let totalTaxes = taxBrackets.reduce(
            (taxes, currentBracket, index) => {

                // Extract current bracket elements
                let bracketMin = currentBracket[0]; 
                let bracketMax = currentBracket[1]; 
                let taxRate = currentBracket[2]; 

                // If salaryRemaining is in the current tax bracket, calculate
                if (salaryRemaining >= bracketMin && salaryRemaining <= bracketMax) {

                    // If the current bracket is not the final (with min 0)... 

                    let taxableIncome = 0; 

                    // In all but the lowest bracket, the bracketMin is a value
                    // above 0. In the lowest bracket, the bracket minimum is 0. 
                    if (index < NUM_BRACKETS - 1) {

                        /* 
                            Starting with the highest tax bracket, the taxable
                            income is only the salary minus the highest bracket's 
                            minimum (anything above the min is taxable). Subtract
                            one to make it inclusive. Ex: anything above 9875 is 
                            taxed in the second bracket. 
                        */
                        taxableIncome = salaryRemaining - (bracketMin);     

                    } else {
                        // If the index is on the final bracket, the minimum is 0, 
                        // not -1. 
                        taxableIncome = salaryRemaining; 
                    }

                    // taxes is the built-in accumulator with reduce()
                    // salaryRemaining is purely used for calculations 
                    taxes = taxes + (taxableIncome * taxRate); 
                    salaryRemaining = salaryRemaining - taxableIncome; 

                }

                return taxes; 

            }, 0
        );

        return totalTaxes; 
    }

    /*
        Calculates federal taxes by tax bracket 
    */  
    const calculateFederalTaxes = (grossSalary) => {
        
        // The federal tax brackets for 2020
        // [bracketMinimum, bracketMaximum, taxRate]
        const taxBrackets = [
            [518400, Number.MAX_SAFE_INTEGER, 0.37], 
            [207351, 518400, 0.35],
            [163301, 207350, 0.32],  
            [85526, 163300, 0.24], 
            [40126, 85525, 0.22], 
            [9876, 40125, 0.12], 
            [0, 9875, 0.10],         
        ];  

        let fedTaxes = bracketCalculations(taxBrackets, grossSalary); 

        return fedTaxes; 

    }

    /*
        Calculate state taxes for Wisconsin by tax bracket
    */
    const calculateStateTaxes = (grossSalary) => {

        // State taxes for Wisconsin 
        // [bracketMin, bracketMax, taxRate]
        const taxBrackets = [
            [0, 11969.99, 0.0354],
            [11970, 23929.99, 0.0465],
            [23930, 263479.99, 0.0627],
            [263480, Number.MAX_SAFE_INTEGER, 0.0765] 
        ];

        let stateTaxes = bracketCalculations(taxBrackets, grossSalary); 
        
        return stateTaxes; 

    }

    /*
        Medicare taxes 1.45% on all earnings. Any earnings after $200,000 
        are taxed an additional 0.9%. 
    */
    const calculateMedicareTaxes = (grossSalary) => {

        const MED_BASE_TAX_RATE = 0.0145; 
        let taxes = grossSalary * MED_BASE_TAX_RATE; 

        // Earnings over $200k get an additional 0.9% tax
        if (grossSalary >= 200000) {
            let above200k = grossSalary - 200000; 
            taxes = taxes + (above200k * (MED_BASE_TAX_RATE + 0.009)); 
        } 

        return taxes; 

    }

    /*
        Social security taxes are 6.2% on earnings up to 137,000 only. Anything
        above that is not taxed for social security. 
    */
    const calculateSocialSecurityTax = (grossSalary) => {

        let SOC_TAX_RATE = 0.062; 

        let taxes = (grossSalary > 137000) ?  137000 * SOC_TAX_RATE 
                : grossSalary  * SOC_TAX_RATE; 

        return taxes; 
    }

}); 