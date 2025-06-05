import React, { useState } from 'react';
import { AppBar, Tabs, Tab, Box, Container } from '@mui/material';
import UploadTab from './components/UploadTab';
import StudentsTab from './components/StudentsTab';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="student data app tabs">
          <Tab label="Upload Data" {...a11yProps(0)} />
          <Tab label="Students" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <UploadTab />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <StudentsTab />
      </TabPanel>
    </Container>
  );
}

export default App;
