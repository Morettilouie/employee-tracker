const db = require('../../db/connection');


// GET all employees table
app.get('/employees', (req, res) => {
    const sql = `SELECT employee.id, first_name, last_name, role.title, department.name AS department, salary, manager_id AS manager 
                FROM employee 
                LEFT JOIN role ON employee.role_id = role.id 
                LEFT JOIN department ON role.department_id = department.id;`;

    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

