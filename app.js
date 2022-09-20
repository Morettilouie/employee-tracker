const db = require('./db/connection');
const inquirer = require('inquirer');


// home prompt
const originalPromt = {
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
        'Terminate Employee, Role, or Department',
        'Quit'
    ]
}

// nature of the program
function terminal() {
    inquirer.prompt(originalPromt).then(data => {
        if (data.option === 'View All Employees') {
            let query = "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.manager_id, manager.first_name AS managerFirst, manager.last_name AS managerLast " +
                "FROM employee " +
                "LEFT JOIN role ON employee.role_id = role.id " +
                "LEFT JOIN department ON role.department_id = department.id " +
                "LEFT JOIN employee AS manager ON employee.manager_id = manager.id;"
            db.query(query, function (err, res) {
                if (err) throw err;

                for (i = 0; i < res.length; i++) {
                    if (res[i].manager_id == 0) {
                        res[i].manager = 'None'
                    } else {
                        res[i].manager = res[i].managerFirst + ' ' + res[i].managerLast;
                    };

                    delete res[i].manager_id;
                    delete res[i].managerFirst;
                    delete res[i].managerLast;
                };
                console.table(res);
                terminal();
            }
            )

        } else if (data.option === 'Add Employee') {
            addEmployee()

        } else if (data.option === 'Update Employee Role') {
            updateEmployee()
        } else if (data.option === 'Terminate Employee, Role, or Department') {
            terminate()
        } else if (data.option === 'View All Roles') {
            db.query(
                `SELECT role.id, title, department.name as department, salary 
                FROM role 
                LEFT JOIN department ON department_id = department.id;`, display
            )
        } else if (data.option === 'Add Role') {
            addRole()
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
                        ('${newDepartment.department}');`
                    )
                })

        } else if (data.option === 'Quit') {
            db.end()
        }
    })
}

var display = function (error, results) {
    console.table(results)
    terminal()
}

function addEmployee() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'First name:'
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Last name:'
        }
    ])
        .then(employee => {
            const info = [employee.firstName, employee.lastName];

            const rolesTable = `SELECT role.id, role.title FROM role`;

            db.query(rolesTable, (err, data) => {
                if (err) throw err;

                const roles = data.map(({ title, id }) => ({ name: title, value: id }));

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: 'Role:',
                        choices: roles
                    }
                ])
                    .then(choice => {
                        const role = choice.role;
                        info.push(role);
                        const managerTable = `SELECT * FROM employee`;
                        db.query(managerTable, (err, data) => {
                            if (err) throw err;

                            managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }));

                            inquirer.prompt([
                                {
                                    type: 'list',
                                    name: 'manager',
                                    message: 'Manager:',
                                    choices: managers
                                }
                            ])
                                .then(choice => {
                                    const manager = choice.manager;
                                    info.push(manager);
                                    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                                VALUES (?, ?, ?, ?)`;

                                    db.query(sql, info, (err, res) => {
                                        if (err) throw err;
                                        console.log("===============");
                                        console.log("Employee added!");
                                        console.log("===============");
                                        terminal();
                                    })
                                })
                        })
                    })
            })
        })
}

function updateEmployee() {
    const employeeTable = `SELECT * FROM employee`;
    db.query(employeeTable, (err, data) => {
        const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }));
        inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Employee:',
                choices: employees
            }
        ])
            .then(choice => {
                const employee = choice.employee;
                const employeeObj = [];
                employeeObj.push(employee);

                const rolesTable = `SELECT role.id, role.title FROM role`;

                db.query(rolesTable, (err, data) => {
                    if (err) throw err;

                    const roles = data.map(({ title, id }) => ({ name: title, value: id }));

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'role',
                            message: 'New role:',
                            choices: roles
                        }
                    ])
                        .then(choice => {
                            const role = choice.role;
                            employeeObj.push(role);

                            let employee = employeeObj[0];
                            employeeObj[0] = role;
                            employeeObj[1] = employee;

                            const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

                            db.query(sql, employeeObj, (err, res) => {
                                if (err) throw err;
                                console.log("=================");
                                console.log("Employee updated!");
                                console.log("=================");
                                terminal();
                            })
                        });
                })
            })
    })
}

function terminate() {
    // find out what to delete
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'terminate',
                message: 'Terminate:',
                choices: ['Employee', 'Role', 'Department']
            }
        ])
        .then(option => {
            // delete employee
            if (option.terminate === 'Employee') {
                const employeeTable = `SELECT * FROM employee`;
                db.query(employeeTable, (err, data) => {
                    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }));

                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                name: 'employee',
                                message: 'Employee:',
                                choices: employees
                            }
                        ])
                        .then(choice => {
                            const employee = choice.employee;
                            const sql = `DELETE FROM employee WHERE id = ?`;
                            db.query(sql, employee, (err, res) => {
                                if (err) throw err;
                                console.log('=================');
                                console.log('Employee deleted!');
                                console.log('=================');
                                terminal();
                            })
                        })
                })
            // delete role
            } else if (option.terminate === 'Role') {
                const roleTable = `SELECT * FROM role`;
                db.query(roleTable, (err, data) => {
                    const roles = data.map(({ title, id }) => ({ name: title, value: id }));

                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                name: 'role',
                                message: 'role:',
                                choices: roles
                            }
                        ])
                        .then(choice => {
                            const employee = choice.role;
                            const sql = `DELETE FROM role WHERE id = ?`;
                            db.query(sql, employee, (err, res) => {
                                if (err) throw err;
                                console.log('=============');
                                console.log('Role deleted!');
                                console.log('=============');
                                terminal();
                            })
                        })
                })
            // delete department
            } else if (option.terminate === 'Department') {
                const departmentTable = `SELECT * FROM department`;
                db.query(departmentTable, (err, data) => {
                    const departments = data.map(({ name, id }) => ({ name: name, value: id }));

                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                name: 'department',
                                message: 'department:',
                                choices: departments
                            }
                        ])
                        .then(choice => {
                            const department = choice.department;
                            const sql = `DELETE FROM department WHERE id = ?`;
                            db.query(sql, department, (err, res) => {
                                if (err) throw err;
                                console.log('===================');
                                console.log('Department deleted!');
                                console.log('===================');
                                terminal();
                            })
                        })
                })
            }
        })
    }


    function addRole() {
        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'New role:'
                },
                {
                    type: 'number',
                    name: 'salary',
                    message: 'salary:'
                }
            ])
            .then(newRole => {
                info = [newRole.title, newRole.salary]
                departmentTable = `SELECT * FROM department`;
                db.query(departmentTable, (err, data) => {
                    if (err) throw err;
                    departments = data.map(({ name, id }) => ({ name: name, value: id }));

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'department',
                            message: 'Department',
                            choices: departments
                        }
                    ])
                        .then(choice => {
                            department = choice.department;
                            info.push(department);

                            const sql = `INSERT INTO role (title, salary, department_id)
                                    VALUES (?, ?, ?)`;

                            db.query(sql, info, (err, res) => {
                                if (err) throw err;
                                console.log("===========");
                                console.log("Role added!");
                                console.log("===========");
                                terminal();
                            })
                        })
                })
            })
    }


    terminal()