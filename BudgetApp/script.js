"use strict";


// BUDGET CONTROLLER

var budgetController = (() => {
    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }

        calcPercentage(totalIncome) {
            if (totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            } else {
                this.percentage = -1;
            }
        }

        getPercentage() {
            return this.percentage;
        }
    }

    class Income extends Expense {
        constructor(id, description, value) {
            super(id, description, value);
        }
    }

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };

    var calculateTotal = (type) => {

        let sum = data.allItems[type].reduce((accumulator, currentValue) => {
            return accumulator + currentValue.value;
        }, 0);

        data.totals[type] = sum;
    };

    return {
        addItem: (type, des, val) => {
            let newItem, ID;
            // ID = last ID + 1

            // Create a new ID

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id;
            } else {
                ID = 0;
            }

            // Creates mew item based on 'inc' or 'exp' type
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure at given type
            data.allItems[type].push(newItem);


            // return new element to be accessed later in other functions
            return newItem;
        },

        deleteItem: (type, id) => {
            let ids, index;

            // Creates an array of ids
            ids = data.allItems[type].map((current) => {
                return current.id;
            });

            // Grabs the index of the element passed in
            index = ids.indexOf(id);

            // if item exist. remove from array
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: () => {
            // Calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");
            // Calculate the budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Checks if over budget
            if (data.budget < 0) {
                alert("You are over budget");
                document.querySelector(".budget__value").style.color =
                    "#ff5049";
            } else {
                document.querySelector(".budget__value").style.color = "white";
            }

            if (data.totals.inc > 0) {
                // Calculate the percentage of income that we spent
                data.percentage = Math.round(
                    (data.totals.exp / data.totals.inc) * 100
                );
            } else {
                data.percentage = -1;
            }
        },

        // Calculate percentage of each expense added to array
        calculatePercentages: () => {
            data.allItems.exp.forEach((current) => {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentage: () => {
            // Retrieve array of all percentages
            var allPerc = data.allItems.exp.map((current) => {
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },

        testing: () => {
            console.log(data);
        },
    };
})();

// UI CONTROLLER

var UIController = (() => {

    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month",
    };

    var formatNumber = (num, type) => {
        let numSplit, int, dec;
       
        num = Math.abs(num);
       

        num = num.toFixed(2);

    
        numSplit = num.split(".");
        
        int = numSplit[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        

        dec = numSplit[1];

     
        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
    };

    let nodeListForEach = (list, callback) => {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: () => {
           
            return {

                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription)
                    .value,
                value: parseFloat(
                    document.querySelector(DOMstrings.inputValue).value
                ),
            };
        },

       
        addListItem: ({ id, description, value }, type) => {
            let html, newHtml, element;

        //create HTML string with placeholder text

            if (type === "inc") {
                element = DOMstrings.incomeContainer;
                html =
                    '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (type === "exp") {
                element = DOMstrings.expensesContainer;
                html =
                    '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //replace the placeholder text with some actual data

            newHtml = html.replace("%id%", id);
            newHtml = newHtml.replace("%description%", description);
            newHtml = newHtml.replace("%value%", formatNumber(value, type));

            //searches for string and places with data that we put in method

            // Insert the HTML into the DOM

            document
                .querySelector(element)
                .insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: (selectorID) => {
            var el = document.getElementById(selectorID);

            // Remove element with specified ID from DOM
            el.parentNode.removeChild(el);
        },

        

        clearFields: () => {
            let fields, fieldsArr;
            
            fields = document.querySelectorAll(
                DOMstrings.inputDescription + " , " + DOMstrings.inputValue
            );

          
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach((element) => {
                element.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: ({ budget, totalInc, totalExp, percentage }) => {
            let type;

            budget > 0 ? (type = "inc") : (type = "exp");

            if (budget !== 0) {
                document.querySelector(
                    DOMstrings.budgetLabel
                ).textContent = formatNumber(budget, type);
            } else {
                document.querySelector(DOMstrings.budgetLabel).textContent =
                    "0.00";
            }
            document.querySelector(
                DOMstrings.incomeLabel
            ).textContent = formatNumber(totalInc, "inc");
            document.querySelector(
                DOMstrings.expensesLabel
            ).textContent = formatNumber(totalExp, "exp");

            if (percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    "---";
            }
        },

        displayPercentage: (percentages) => {
            let fields = document.querySelectorAll(
                DOMstrings.expensesPercLabel
            );

            // When called pass in fields and callback function to handle data
            nodeListForEach(fields, (current, index) => {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
            });
        },

        displayMonth: () => {
            let now, months, year, month;

            // Current Date
            now = new Date();

            months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent =
                months[month] + " " + year;
        },

        changedType: () => {
            var fields = document.querySelectorAll(
                DOMstrings.inputType +
                    "," +
                    DOMstrings.inputDescription +
                    "," +
                    DOMstrings.inputValue
            );

            nodeListForEach(fields, (current) => {
                current.classList.toggle("red-focus");
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        },

        getDOMstrings: () => {
            return DOMstrings;
        },
    };
})();


// GLOBAL APP CONTROLLER

var controller = ((budgetCtrl, UICtrl) => {

    var setupEventListeners = () => {
        var DOM = UICtrl.getDOMstrings();

        
        document
            .querySelector(DOM.inputBtn)
            .addEventListener("click", ctrlAddItem);

        
        document.addEventListener("keypress", (event) => {
            // if (event.keyCode === 13 || event.which === 13) {
            if (event.key === "Enter") {
                ctrlAddItem();
            }
        });

        document
            .querySelector(DOM.container)
            .addEventListener("click", ctrlDeleteItem);

        document
            .querySelector(DOM.inputType)
            .addEventListener("change", UICtrl.changedType);
    };

    var updateBudget = () => {

        // 1. Calculate the budget

        budgetCtrl.calculateBudget();

        // 2. Return the budget

       var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI

        UICtrl.displayBudget(budget);
    };

    var updatePercentages = () => {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentage();

        // 3. Update he UI with the new percentages
        UICtrl.displayPercentage(percentages);
    };

    var ctrlAddItem = () => {
        let input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        // 2. Add the item to the budget control
        if (input.value > 0) {
            newItem = budgetCtrl.addItem(
                input.type,
                input.description,
                input.value
            );

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();

        } else if (input.description === "") {
            alert("Description Needed");
        } else if (isNaN(input.value)) {
            alert("Valid Number Needed");
        }
    };

    var ctrlDeleteItem = (event) => {
        let itemID, splitID, type, ID;

      
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // If ID exist
        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from the UI

            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: () => {
            console.log("Application has started.");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListeners();
        },
    };
})(budgetController, UIController); 


controller.init();