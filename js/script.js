const grossSalaryElement = document.querySelector('#grossSalary'); 
const submitButton = document.querySelector('#submitBtn');
const chartSection = document.querySelector('#chartSection');

const handler = (event) => {

    event.preventDefault(); 
    console.log(event); 

    // if the chart is already being output, clear it
    chartSection.innerHTML = ''; 

    // Pull the grossSalary from the text input
    let grossSalary = grossSalaryElement.value;

    // All types of taxes needed for this app
    let fedTaxes = parseFloat(calculateFederalTaxes(grossSalary).toFixed(2));  
    let stateTaxes = parseFloat(calculateStateTaxes(grossSalary).toFixed(2)); 
    let medicareTaxes = parseFloat(calculateMedicareTaxes(grossSalary).toFixed(2)); 
    let ssnTaxes = parseFloat(calculateSocialSecurityTax(grossSalary).toFixed(2)); 
    let totalTaxes = (fedTaxes + stateTaxes + medicareTaxes + ssnTaxes).toFixed(2); 
    let netPay = grossSalary - totalTaxes; 

    // Clear out the previously calculated salary 
    grossSalaryElement.value = ""; 

    // Create the chart itself and then append it 
    let chart = document.createElement("table"); 
    chart.innerHTML = 
            `<tr><th>Gross Pay</th><td>$${grossSalary}</td></tr>`
            + `<tr><th>Federal Taxes</th><td>$${fedTaxes}</td></tr>`
            + `<tr><th>State Taxes</th><td>$${stateTaxes}</td></tr>`
            + `<tr><th>Medicare Taxes</th><td>$${medicareTaxes}</td></tr>`
            + `<tr><th>SSN Taxes</th><td>$${ssnTaxes}</td></tr>`
            + `<tr><th>Total Taxes</th><td>$${totalTaxes}</td></tr>`
            + `<tr><th>Net Pay</th><td>$${netPay}</td></tr>`
    ;
    chart.id = "taxChart"; 

    chartSection.appendChild(chart); 

}

grossSalaryElement.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        handler(event); 
    }
});

submitButton.addEventListener('click', (event) => {
    
    handler(event); 

});

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
            if (salaryRemaining >= bracketMin && salaryRemaining < bracketMax) {

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