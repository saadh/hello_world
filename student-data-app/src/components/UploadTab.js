import React, { useState } from 'react';
import { Button, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert } from '@mui/material';
import * as XLSX from 'xlsx';
import axios from 'axios';
import validator from 'validator';

const UploadTab = () => {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({});
    const [validationErrors, setValidationErrors] = useState([]);
    const [uploadMessage, setUploadMessage] = useState('');
    const [uploadError, setUploadError] = useState('');

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        setData([]);
        setSummary({});
        setValidationErrors([]);
        setUploadMessage('');
        setUploadError('');

        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const binaryStr = e.target.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                processData(jsonData);
            };
            reader.readAsBinaryString(selectedFile);
        }
    };

    const validateAndCleanStudentData = (rowData) => {
        const errors = [];
        const cleanedData = {};

        // Trim whitespace and map to expected keys (using lowercase with underscores as per user's data)
        cleanedData.student_id = rowData['student_id'] ? String(rowData['student_id']).trim() : '';
        cleanedData.student_name = rowData['student_name'] ? String(rowData['student_name']).trim() : ''; // Include student_name
        cleanedData.grade_name = rowData['grade_name'] ? String(rowData['grade_name']).trim() : '';
        cleanedData.class_name = rowData['class_name'] ? String(rowData['class_name']).trim() : '';
        cleanedData.phone = rowData['phone'] ? String(rowData['phone']).trim() : '';
        cleanedData.email = rowData['email'] ? String(rowData['email']).trim() : '';

        // Validate student_id (no special characters)
        if (!/^[a-zA-Z0-9]+$/.test(cleanedData.student_id)) {
            errors.push(`Invalid Student ID: "${cleanedData.student_id}". Only alphanumeric characters are allowed.`);
        }

        // Validate student_name (not empty)
        if (!cleanedData.student_name) {
            errors.push(`Student name is required.`);
        }

        // Validate phone (9-digit number)
        if (!/^\d{9}$/.test(cleanedData.phone)) {
            errors.push(`Invalid Phone: "${cleanedData.phone}". Must be a 9-digit number.`);
        }

        // Validate grade_name and class_name (no special characters)
        if (!/^[a-zA-Z0-9\s]+$/.test(cleanedData.grade_name)) {
            errors.push(`Invalid Grade Name: "${cleanedData.grade_name}". Only alphanumeric characters and spaces are allowed.`);
        }
        if (!/^[a-zA-Z0-9\s]+$/.test(cleanedData.class_name)) {
            errors.push(`Invalid Class Name: "${cleanedData.class_name}". Only alphanumeric characters and spaces are allowed.`);
        }

        // Validate email
        if (!validator.isEmail(cleanedData.email)) {
            errors.push(`Invalid Email: "${cleanedData.email}".`);
        }

        return { cleanedData, errors };
    };

    const processData = (jsonData) => {
        const processedData = [];
        const errorsFound = [];
        const classGradeSummary = {};

        jsonData.forEach((row, index) => {
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
                errorsFound.push({ row: index + 1, data: row, errors });
            }
            processedData.push({ ...cleanedData, originalRow: row, hasError: errors.length > 0 });

            // Calculate summary
            const grade = cleanedData.grade_name;
            const className = cleanedData.class_name;

            if (grade && className && errors.length === 0) {
                if (!classGradeSummary[grade]) {
                    classGradeSummary[grade] = {};
                }
                if (!classGradeSummary[grade][className]) {
                    classGradeSummary[grade][className] = 0;
                }
                classGradeSummary[grade][className]++;
            }
        });

        setData(processedData);
        setValidationErrors(errorsFound);
        setSummary(classGradeSummary);
    };

    const handleUpload = async () => {
        if (!file) {
            setUploadError('Please select a file first.');
            return;
        }

        if (validationErrors.length > 0) {
            setUploadError('Cannot upload due to validation errors. Please correct the data.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUploadMessage(response.data);
            setUploadError('');
            // Clear data after successful upload
            setFile(null);
            setData([]);
            setSummary({});
            setValidationErrors([]);
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadMessage('');
            if (error.response && error.response.data) {
                setUploadError(error.response.data.message || error.response.data);
            } else {
                setUploadError('Error uploading file. Please try again.');
            }
        }
    };

    return (
        <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Upload Student Data
            </Typography>
            <Box sx={{ mb: 3 }}>
                <input
                    accept=".csv, .xls, .xlsx"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    multiple
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="raised-button-file">
                    <Button variant="contained" component="span">
                        Select File
                    </Button>
                </label>
                {file && <Typography sx={{ ml: 2 }}>Selected: {file.name}</Typography>}
            </Box>

            {uploadMessage && <Alert severity="success" sx={{ mb: 2 }}>{uploadMessage}</Alert>}
            {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}

            {validationErrors.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="h6">Validation Warnings:</Typography>
                    <ul>
                        {validationErrors.map((err, index) => (
                            <li key={index}>
                                Row {err.row}: {err.errors.join(', ')}
                                <pre>{JSON.stringify(err.data, null, 2)}</pre>
                            </li>
                        ))}
                    </ul>
                </Alert>
            )}

            {data.length > 0 && (
                <Box sx={{ my: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Data Preview
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student ID</TableCell>
                                    <TableCell>Student Name</TableCell> {/* Include student_name */}
                                    <TableCell>Grade Name</TableCell>
                                    <TableCell>Class Name</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Email</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow key={index} sx={{ backgroundColor: row.hasError ? '#ffebee' : 'inherit' }}>
                                        <TableCell>{row.student_id}</TableCell>
                                        <TableCell>{row.student_name}</TableCell> {/* Include student_name */}
                                        <TableCell>{row.grade_name}</TableCell>
                                        <TableCell>{row.class_name}</TableCell>
                                        <TableCell>{row.phone}</TableCell>
                                        <TableCell>{row.email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Typography variant="h5" gutterBottom>
                        Data Summary (Students per Class per Grade)
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Grade</TableCell>
                                    <TableCell>Class</TableCell>
                                    <TableCell>Student Count</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(summary).map(([grade, classes]) => (
                                    Object.entries(classes).map(([className, count]) => (
                                        <TableRow key={`${grade}-${className}`}>
                                            <TableCell>{grade}</TableCell>
                                            <TableCell>{className}</TableCell>
                                            <TableCell>{count}</TableCell>
                                        </TableRow>
                                    ))
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Button variant="contained" color="primary" onClick={handleUpload} disabled={validationErrors.length > 0}>
                        Upload Data to System
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default UploadTab;
