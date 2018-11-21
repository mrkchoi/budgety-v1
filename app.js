
/******************* 
 * BUDGET CONTROLLER
*******************/ 
let budgetController = (function() {

    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    let calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    return {
        addItem: function(type, des, val) {
            let newItem, ID;

            // ID = last ID + 1

            // Create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            
            // Create new item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },
        deleteItem: function(type, id) {
            let ids, index;
            
            // id = 3
            ids = data.allItems[type].map(function(item) {
                return item.id; 
            });

            index = ids.indexOf(id);
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function() {
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function() {
            console.log(data);
        }
    };


})();


/******************* 
 * UI CONTROLLER
*******************/ 
let UIController = (function() {
    let DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }

    // 
    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value) 
            }
        },
        addListItem: function(obj, type) {
            let html, element;
            // Create HTML string with placeholder text

            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${obj.value}</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
            } else {
                element = DOMStrings.expensesContainer;
                html =  `<div class="item clearfix" id="exp-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${obj.value}</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
            }

            // Replace the placeholder text with actual data


            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
            
        },
        deleteListItem: function(selectorID) {
            let el = document.querySelector(`#${selectorID}`);
            el.remove();
        },
        clearFields: function() {
            let fields, fieldsArr;
            fields = document.querySelectorAll(`${DOMStrings.inputDescription}, ${DOMStrings.inputValue}`);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });

            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {

            document.querySelector(DOMStrings.budgetLabel).textContent = `$${obj.budget}`;
            document.querySelector(DOMStrings.incomeLabel).textContent = `$${obj.totalInc}`;
            document.querySelector(DOMStrings.expensesLabel).textContent = `$${obj.totalExp}`;
            

            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = `${obj.percentage}%`;
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = `---`;
            }

        },
        getDOMStrings: function() {
            return DOMStrings;
        }
    }

})();


/******************* 
 * GLOBAL APP CONTROLLER
*******************/ 
let controller = (function(budgetCtrl, UICtrl) {

    let setupEventListeners = function() {
        let DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.addEventListener('keypress', function(e) {
            // console.log(e.keyCode);
            if(e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });
    }
    
    let updateBudget = function() {
        // Calculate the budget
        budgetCtrl.calculateBudget();

        // Return the budget
        let budget = budgetCtrl.getBudget();

        // Display the budget in UI
        UICtrl.displayBudget(budget);
    }

    let ctrlAddItem = function() {

        let input, newItem;
        // Get input data
        input = UICtrl.getinput();

        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // Add item to UI
            UICtrl.addListItem(newItem, input.type);

            // Clear the fields
            UICtrl.clearFields();

            // Calculate and update budget
            updateBudget();
        }
    }

    let ctrlDeleteItem = function(e) {
        let itemID, splitID, type, id;
        
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
        // console.log(itemID);
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            // console.log(type, id);

            // Delete the item from the data structure
            budgetCtrl.deleteItem(type, id);

            // Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // Update and show the new budget
            updateBudget();
        }
    }

    return {
        init: function() {
            console.log('Application has started!');
            // Display the budget in UI
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            
            setupEventListeners();
        }
    }
    

})(budgetController, UIController);

controller.init();