const grossSalaryElement = document.querySelector('#grossSalary'); 
const submitButton = document.querySelector('#submit'); 

submitButton.addEventListener('click', (event) => {

    // Pull the grossSalary from the text input
    let grossSalary = grossSalaryElement.value;

    // All variables to be calculated in this application 
    let fedTaxes = calculateFederalTaxes(grossSalary);  
    let stateTaxes = calculateStateTaxes(grossSalary); 
    let medicareTaxes; 
    let ssnTaxes; 
    let totalTaxes; 
    let netPay; 

    console.log(fedTaxes); 

    // Clear out the previously calculated salary 
    grossSalaryElement.value = ""; 

});

/*
    A standardized, generalized way to calculate brackets that uses
    tax brackets with any number of brackets. 
*/
const bracketCalculations = (taxBrackets, salaryRemaining) => {

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
                    taxableIncome = salaryRemaining - (bracketMin - 1);     

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
        [518400, Number.MAX_SAFE_INTEGER], 
        [207351, 518400, 0.35],
        [163301, 207350, 0.32],  
        [85526, 163300, 0.24], 
        [40126, 85525, 0.22], 
        [9876, 40125, 0.12], 
        [0, 9875, 0.10],         
    ];  

    let fedTaxes = bracketCalculations(taxBrackets, salaryRemaining); 

    return fedTaxes; 

}

/*
    Calculate state taxes for Wisconsin by tax bracket
*/
const calculateStateTaxes = (grossSalary) => {

    const taxBrackets = [
        [0, 11969.99, 0.0354],
        [11970, 23929.99, 0.0465],
        [23930, 263479.99, 0.0627],
        [263480, Number.MAX_SAFE_INTEGER, 15999.67, 0.0765] 
    ];

}