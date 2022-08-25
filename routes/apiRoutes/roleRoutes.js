const db = require('../../db/connection');


// GET all departments table
app.get('/roles', (req, res) => {
    const sql = `SELECT role.id, title, department.name as department, salary 
                FROM role 
                LEFT JOIN department ON department_id = department.id;`;

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