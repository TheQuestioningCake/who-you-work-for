const inquirer = require('inquirer');
const mysql = require('mysql2');
// create a password.js file in the same directory as index.js
// then you'll use this password to connect to the database
const PASSWORD = require('./password');
const greeting = require('./assets/ascii/greeting');
const { BOOLEAN } = require('sequelize');

// create a connection to the database
const connection = mysql.createConnection({
    host: 'localhost',
    
    user: 'root',
    
    password: PASSWORD,

    database: 'employee_db'
},
console.log(`Connected to the employee_db database.`)
);

// funtion to intialize the program
function employeeManager(){
    console.log(greeting);
    const choices = ['View All Employees', 
    'Add Employee', 
    'Update Employee Role', 
    'View All Roles', 
    'Add Role', 
    'View All Departments', 
    'Add Department', 
    'Quit'];
// prompt the user to select an action
    inquirer
        .prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: choices
    })
    .then((response) => {
        switch(response.action){
            case choices[0]:
                displayTable('employee');
                break;
            case choices[1]:
                addEmployee();
                break;
            case choices[2]:
                updateEmployeeRole();
                break;
            case choices[3]:
                displayTable('roles');
                break;
            case choices[4]:
                addRole();
                break;
            case choices[5]:
                displayTable('department');
                break;
            case choices[6]:
                addDepartment();
                break;
            case choices[7]:
                console.log('Closing the application. Ciao!')
                connection.end();
                break;
        }
    });
}

// function to add an employee to the database
function addEmployee(){
// query the database for the current roles
    let currentRoles = [];
    connection.query('SELECT * FROM roles', (err, results) => {
        if (err){
            console.error(err);
        } else {
            results.forEach((result) => {
                currentRoles.push(result.title);
            });
        }
    });

    let employees = [{name: 'None', id: null}];
    connection.query('SELECT * FROM employee', (err, results) => {
        if (err){
            console.error(err);
        } else {
            results.forEach((result) => {
                employees.push({name: `${result.first_name} ${result.last_name}`, id: result.id});
            });
        }
    });
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'Enter the employee\'s first name:',
                validate: (input) => {
                    return input ? true : (console.log('Please enter a first name.'), false);
                }
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'Enter the employee\'s last name:',
                validate: (input) => {
                    return input ? true : (console.log('Please enter a last name.'), false);
                }
            },
            {
                type: 'list',
                name: 'role',
                message: 'Select the employee\'s role:',
                choices: currentRoles
            },
            {
                type: 'list',
                name: 'manager',
                message: 'Select the employee\'s manager:',
                choices: employees
            }
        ])
        .then((response) => {
            new Promise((resolve, reject) => {
                connection.query('SELECT id FROM roles WHERE title = ?', [response.role], (err, results) => {
                    if (err){
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(results[0].id);
                    }
                });
            })
            .then((rolesId) => {
                new Promise((resolve, reject) => {
                    connection.query('SELECT id FROM employee WHERE first_name = ? AND last_name = ?', [response.manager.split(' ')[0], response.manager.split(' ')[1]], (err, results) => {
                        if (err){
                            console.error(err);
                            reject(err);
                        } else {
                            resolve(results[0].id);
                        }
                    });
                })
                .then((managerId) => {
                    if (response.manager === 'None'){
                        managerId = null;
                    }
                    connection.query('INSERT INTO employee SET ?', {
                        first_name: response.firstName,
                        last_name: response.lastName,
                        roles_id: rolesId,
                        manager_id: managerId
                    }, (err, results) => {
                        if (err){
                            console.error(err);
                        } else {
                            console.log('Employee added successfully.');
                            employeeManager();
                        }
                    });
                })
                .catch((err) => {
                    console.error(err);
                });
            })
            .catch((err) => {
                console.error(err);
            });
        });      
}

// function to add a department to the database
function addDepartment(){
    inquirer
        .prompt({
            type: 'input',
            name: 'department',
            message: 'Enter the name of the department:',
            validate: (input) => {
                return input ? true : (console.log('Please enter a department name.'), false);
            }
        })
        .then((response) => {
            connection.query('INSERT INTO department SET ?', {
                deparment_name: response.department
            }, (err, results) => {
                if (err){
                    console.error(err);
                } else {
                    console.log('Department added successfully.');
                    employeeManager();
                }
            });
        });
} 

// function to add a role to the database
function addRole() {
    let departments = [];
    connection.query('SELECT * FROM department', (err, results) => {
        if (err){
            console.error(err);
        } else {
            results.forEach((result) => {
                departments.push(result.deparment_name);
            });
        }
    });
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the title of the role:',
                validate: (input) => {
                    return input ? true : (console.log('Please enter a role title.'), false);
                }
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the salary for the role:',
                validate: (input) => {
                    return input ? true : (console.log('Please enter a salary.'), false);
                }
            },
            {
                type: 'list',
                name: 'department',
                message: 'Select the department for the role:',
                choices: departments
            }
        ])
        .then((response) => {
            new Promise((resolve, reject) => {
                connection.query('SELECT id FROM department WHERE deparment_name = ?', [response.department], (err, results) => {
                    if (err){
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(results[0].id);
                    }
                });
            })
            .then((departmentId) => {
                connection.query('INSERT INTO roles SET ?', {
                    title: response.title,
                    salary: response.salary,
                    department_id: departmentId
                }, (err, results) => {
                    if (err){
                        console.error(err);
                    } else {
                        console.log('Role added successfully.');
                        employeeManager();
                    }
                });
            })
            .catch((err) => {
                console.error(err);
            });
        });
}

// function to update an employee's role
function updateEmployeeRole(){
    let rolesArray = [];
  let employeesArray = [];

  connection.query("SELECT * FROM roles", function (err, roles) {
    if (err) {
      console.error(err);
    } else {
      roles.forEach((role) => {
        rolesArray.push({ name: role.title, value: role.id });
      });

      connection.query("SELECT * FROM employee", function (err, employees) {
        if (err) {
          console.error(err);
        } else {
          employees.forEach((employee) => {
            let fullName = `${employee.first_name} ${employee.last_name}`;
            employeesArray.push({ name: fullName, value: employee.id });
          });

          inquirer
            .prompt([
              {
                type: "list",
                message: "Which employee's role do you want to update?",
                name: "employee",
                choices: employeesArray,
              },
              {
                type: "list",
                message:
                  "Which role do you want to assign the selected employee?",
                name: "role",
                choices: rolesArray,
              },
            ])
            .then((response) => {
              const sql = `UPDATE employee SET roles_id = ? WHERE id = ?`;
              const params = [response.role, response.employee];
              connection.query(
                `UPDATE employee SET roles_id = ? WHERE id = ?`,
                params,
                 (err, results) => {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log(`Updated employee's role successfully.`);
                    employeeManager();
                  }
                }
              );
            });
        }
      });
    }
  });
}

// function to display tables
function displayTable(table){
    connection.query(`SELECT * FROM ${table}`, (err, results) => {
        if (err){
            console.error(err);
        } else {
            console.table(results);
            employeeManager();
        }
    });
}

employeeManager();