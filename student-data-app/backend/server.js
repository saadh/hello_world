const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const validator = require('validator');
const xlsx = require('xlsx');
const fs = require('fs'); // For file system operations

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Configure MySQL connection
const db = mysql.createConnection({
    host: 'localhost', // Replace with your MySQL host
    user: 'root',      // Replace with your MySQL username
    password: '', // Replace with your MySQL password
    database: 'student_db' // Replace with your database name
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');

    // Create students table if it doesn't exist
    const createTableSql = `
        CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id VARCHAR(20) NOT NULL UNIQUE,
            student_name VARCHAR(100) NOT NULL,
            grade_name VARCHAR(50),
            class_name VARCHAR(50),
            phone BIGINT,
            email VARCHAR(100)
        )
    `;
    db.query(createTableSql, (err, result) => {
        if (err) {
            console.error('Error creating students table:', err);
            return;
        }
        console.log('Students table created or already exists');
    });
});

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Files will be temporarily stored in 'uploads/' directory

// Helper function for data validation and cleaning
const validateAndCleanStudentData = (data) => {
    const errors = [];
    const cleanedData = { ...data };

    // Trim whitespace
    for (const key in cleanedData) {
        if (typeof cleanedData[key] === 'string') {
            cleanedData[key] = cleanedData[key].trim();
        }
    }

    // Validate student_id (no special characters)
    if (!/^[a-zA-Z0-9]+$/.test(cleanedData.student_id)) {
        errors.push(`Invalid student_id: ${cleanedData.student_id}. Only alphanumeric characters are allowed.`);
    }

    // Validate student_name (not empty)
    if (!cleanedData.student_name) {
        errors.push(`Student name is required.`);
    }

    // Validate phone (9-digit number)
    if (!/^\d{9}$/.test(cleanedData.phone)) {
        errors.push(`Invalid phone number: ${cleanedData.phone}. Must be a 9-digit number.`);
    }

    // Validate grade_name and class_name (no special characters)
    if (!/^[a-zA-Z0-9\s]+$/.test(cleanedData.grade_name)) {
        errors.push(`Invalid grade_name: ${cleanedData.grade_name}. Only alphanumeric characters and spaces are allowed.`);
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(cleanedData.class_name)) {
        errors.push(`Invalid class_name: ${cleanedData.class_name}. Only alphanumeric characters and spaces are allowed.`);
    }

    // Validate email
    if (!validator.isEmail(cleanedData.email)) {
        errors.push(`Invalid email: ${cleanedData.email}.`);
    }

    return { cleanedData, errors };
};

// API endpoint for file upload and data storage
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        const studentsToInsert = [];
        const validationErrors = [];

        jsonData.forEach(row => {
            // Use lowercase column names from the uploaded file
            const studentData = {
                student_id: row['student_id'],
                student_name: row['student_name'], // Include student_name
                grade_name: row['grade_name'],
                class_name: row['class_name'],
                phone: row['phone'],
                email: row['email']
            };

            const { cleanedData, errors } = validateAndCleanStudentData(studentData);

            if (errors.length > 0) {
                validationErrors.push({ row: studentData, errors });
            } else {
                studentsToInsert.push(cleanedData);
            }
        });

        // Remove the temporary file
        fs.unlinkSync(filePath);

        if (validationErrors.length > 0) {
            return res.status(400).json({ message: 'Validation errors found in uploaded data.', errors: validationErrors });
        }

        if (studentsToInsert.length === 0) {
            return res.status(400).send('No valid student data found to insert.');
        }

        // Insert data into MySQL
        const sql = 'INSERT INTO students (student_id, student_name, grade_name, class_name, phone, email) VALUES ?';
        // Explicitly map to the expected columns to ignore any extra columns in the uploaded file
        const values = studentsToInsert.map(s => [
            s.student_id,
            s.student_name, // Include student_name
            s.grade_name,
            s.class_name,
            s.phone,
            s.email
        ]);

        db.query(sql, [values], (err, result) => {
            if (err) {
                console.error('Error inserting data into database:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send('Duplicate Student ID found. Please ensure all Student IDs are unique.');
                }
                return res.status(500).send('Error storing data in database.');
            }
            res.status(200).send('Data uploaded and stored successfully.');
        });

    } catch (error) {
        console.error('Error processing file:', error);
        // Ensure the temporary file is removed even if an error occurs
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        res.status(500).send('Error processing file.');
    }
});

// API endpoint to get all students
app.get('/students', (req, res) => {
    const sql = 'SELECT * FROM students';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            res.status(500).send('Error fetching students');
            return;
        }
        res.status(200).json(results);
    });
});

// API endpoint to update a student
app.put('/students/:id', (req, res) => {
    const { id } = req.params;
    const { student_id, student_name, grade_name, class_name, phone, email } = req.body; // Include student_name

    // Validate and clean data
    const { cleanedData, errors } = validateAndCleanStudentData({ student_id, student_name, grade_name, class_name, phone, email }); // Include student_name

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation errors in update data.', errors });
    }

    const sql = 'UPDATE students SET student_id = ?, student_name = ?, grade_name = ?, class_name = ?, phone = ?, email = ? WHERE id = ?'; // Include student_name
    db.query(sql, [cleanedData.student_id, cleanedData.student_name, cleanedData.grade_name, cleanedData.class_name, cleanedData.phone, cleanedData.email, id], (err, result) => { // Include student_name
        if (err) {
            console.error('Error updating student:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).send('Duplicate Student ID found. Please ensure Student ID is unique.');
            }
            res.status(500).send('Error updating student');
            return;
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Student not found');
        }
        res.status(200).send('Student updated successfully');
    });
});

// API endpoint to delete a student
app.delete('/students/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM students WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting student:', err);
            res.status(500).send('Error deleting student');
            return;
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Student not found');
        }
        res.status(200).send('Student deleted successfully');
    });
});

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
