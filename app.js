const db = require('./db/connection');
const inquirer = require('inquirer');
const cTable = require('console.table');

var display = function (error, results) {
    console.table(results)
}

const addEmployee = [
    {
        type: 'input',
        name: 'firstName',
        message: 'First name:'
    },
    {
        type: 'input',
        name: 'lastName',
        message: 'Last name:'
    },
    // {
    //     type: 'list',
    //     name: 'role',
    //     message: 'Role:',
    //     choices: [

    //     ]
    // }
]

const addRole = [
    {
        type: 'input',
        name: 'title',
        message: 'New role:'
    },
    {
        type: 'number',
        name: 'department',
        message: 'department:'
    },
    {
        type: 'number',
        name: 'salary',
        message: 'salary:'
    }
]

const startProgram = function () {
    inquirer
        .prompt({
            type: 'list',
            name: 'option',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'Add Employee',
                'Update Employee Role',
                'View All Roles',
                'Add Role',
                'View All Departments',
                'Add Department',
                'Quit'
            ]
        })
        .then(data => {
            if (data.option === 'View All Employees') {
                db.query(
                    `SELECT employee.id, first_name, last_name, role.title, department.name AS department, salary, manager_id AS manager 
                    FROM employee 
                    LEFT JOIN role ON employee.role_id = role.id 
                    LEFT JOIN department ON role.department_id = department.id;`, display
                )
            } else if (data.option === 'Add Employee') {
                inquirer
                    .prompt(addEmployee)
                    .then(employee => {
                        db.query(
                            `INSERT INTO employee (first_name, last_name)
                            VALUES
                            ('${employee.firstName}', '${employee.lastName}');`, display
                        )
                    })

            } else if (data.option === 'View All Roles') {
                db.query(
                    `SELECT role.id, title, department.name as department, salary 
                    FROM role 
                    LEFT JOIN department ON department_id = department.id;`, display
                )
            } else if (data.option === 'Add Role') {
                inquirer
                    .prompt(addRole)
                    .then(newRole => {
                        db.query(
                            `INSERT INTO role (title, department_id, salary)
                            VALUES
                            ('${newRole.title}', ${newRole.department}, ${newRole.salary});`, display
                        )
                    })

            } else if (data.option === 'View All Departments') {
                db.query(
                    `SELECT * FROM department;`, display
                )
            } else if (data.option === 'Add Department') {
                inquirer
                    .prompt({
                        type: 'input',
                        name: 'department',
                        message: 'New department:'
                    })
                    .then(newDepartment => {
                        db.query(
                            `INSERT INTO department (name)
                            VALUES
                            ('${newDepartment.department}');`, display
                        )
                    })

            }
        })
}

startProgram()