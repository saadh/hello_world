import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, IconButton, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import validator from 'validator';

const StudentsTab = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editRowId, setEditRowId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [editErrors, setEditErrors] = useState({});

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/students');
            setStudents(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching students:', err);
            setError('Error fetching students. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const validateAndCleanStudentData = (data) => {
        const errors = {};
        const cleanedData = { ...data };

        // Trim whitespace
        for (const key in cleanedData) {
            if (typeof cleanedData[key] === 'string') {
                cleanedData[key] = cleanedData[key].trim();
            }
        }

        // Validate student_id (no special characters)
        if (!/^[a-zA-Z0-9]+$/.test(cleanedData.student_id)) {
            errors.student_id = 'Only alphanumeric characters are allowed.';
        }

        // Validate student_name (not empty)
        if (!cleanedData.student_name) {
            errors.student_name = 'Student name is required.';
        }

        // Validate phone (9-digit number)
        if (!/^\d{9}$/.test(cleanedData.phone)) {
            errors.phone = 'Must be a 9-digit number.';
        }

        // Validate grade_name and class_name (no special characters)
        if (!/^[a-zA-Z0-9\s]+$/.test(cleanedData.grade_name)) {
            errors.grade_name = 'Only alphanumeric characters and spaces are allowed.';
        }
        if (!/^[a-zA-Z0-9\s]+$/.test(cleanedData.class_name)) {
            errors.class_name = 'Only alphanumeric characters and spaces are allowed.';
        }

        // Validate email
        if (!validator.isEmail(cleanedData.email)) {
            errors.email = 'Invalid email format.';
        }

        return { cleanedData, errors };
    };

    const handleEditClick = (student) => {
        setEditRowId(student.id);
        setEditFormData({ ...student });
        setEditErrors({});
    };

    const handleCancelEdit = () => {
        setEditRowId(null);
        setEditFormData({});
        setEditErrors({});
    };

    const handleEditFormChange = (event) => {
        const { name, value } = event.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleSaveEdit = async (id) => {
        const { cleanedData, errors } = validateAndCleanStudentData(editFormData);

        if (Object.keys(errors).length > 0) {
            setEditErrors(errors);
            return;
        }

        try {
            await axios.put(`http://localhost:5000/students/${id}`, cleanedData);
            setEditRowId(null);
            setEditFormData({});
            setEditErrors({});
            fetchStudents(); // Refresh the list
            setError('');
        } catch (err) {
            console.error('Error updating student:', err);
            if (err.response && err.response.data) {
                setError(err.response.data.message || err.response.data);
            } else {
                setError('Error updating student. Please try again.');
            }
        }
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await axios.delete(`http://localhost:5000/students/${id}`);
                fetchStudents(); // Refresh the list
                setError('');
            } catch (err) {
                console.error('Error deleting student:', err);
                if (err.response && err.response.data) {
                    setError(err.response.data.message || err.response.data);
                } else {
                    setError('Error deleting student. Please try again.');
                }
            }
        }
    };

    if (loading) {
        return <Typography>Loading students...</Typography>;
    }

    return (
        <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                All Students
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student ID</TableCell>
                            <TableCell>Student Name</TableCell>
                            <TableCell>Grade Name</TableCell>
                            <TableCell>Class Name</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell>
                                    {editRowId === student.id ? (
                                        <TextField
                                            name="student_id"
                                            value={editFormData.student_id || ''}
                                            onChange={handleEditFormChange}
                                            error={!!editErrors.student_id}
                                            helperText={editErrors.student_id}
                                            size="small"
                                        />
                                    ) : (
                                            student.student_id
                                    )}
                                </TableCell>
                                 <TableCell>
                                    {editRowId === student.id ? (
                                        <TextField
                                            name="student_name"
                                            value={editFormData.student_name || ''}
                                            onChange={handleEditFormChange}
                                            error={!!editErrors.student_name}
                                            helperText={editErrors.student_name}
                                            size="small"
                                        />
                                    ) : (
                                            student.student_name
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editRowId === student.id ? (
                                        <TextField
                                            name="grade_name"
                                            value={editFormData.grade_name || ''}
                                            onChange={handleEditFormChange}
                                            error={!!editErrors.grade_name}
                                            helperText={editErrors.grade_name}
                                            size="small"
                                        />
                                    ) : (
                                            student.grade_name
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editRowId === student.id ? (
                                        <TextField
                                            name="class_name"
                                            value={editFormData.class_name || ''}
                                            onChange={handleEditFormChange}
                                            error={!!editErrors.class_name}
                                            helperText={editErrors.class_name}
                                            size="small"
                                        />
                                    ) : (
                                            student.class_name
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editRowId === student.id ? (
                                        <TextField
                                            name="phone"
                                            value={editFormData.phone || ''}
                                            onChange={handleEditFormChange}
                                            error={!!editErrors.phone}
                                            helperText={editErrors.phone}
                                            size="small"
                                        />
                                    ) : (
                                            student.phone
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editRowId === student.id ? (
                                        <TextField
                                            name="email"
                                            value={editFormData.email || ''}
                                            onChange={handleEditFormChange}
                                            error={!!editErrors.email}
                                            helperText={editErrors.email}
                                            size="small"
                                        />
                                    ) : (
                                            student.email
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editRowId === student.id ? (
                                        <>
                                            <IconButton onClick={() => handleSaveEdit(student.id)} color="primary">
                                                <SaveIcon />
                                            </IconButton>
                                            <IconButton onClick={handleCancelEdit} color="secondary">
                                                <CancelIcon />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <>
                                            <IconButton onClick={() => handleEditClick(student)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteClick(student.id)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default StudentsTab;
