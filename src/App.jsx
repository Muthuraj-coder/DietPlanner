import React from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";

const App = () => (
  <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
    <Typography variant="h3" gutterBottom>NutriFlow</Typography>
    <Typography variant="h6" gutterBottom>
      Your personalized nutrition coach
    </Typography>
    <Box sx={{ mt: 4 }}>
      <Button component={Link} to="/login" variant="contained" color="primary" sx={{ mr: 2 }}>
        Login
      </Button>
      <Button component={Link} to="/signup" variant="outlined" color="primary">
        Sign Up
      </Button>
    </Box>
  </Container>
);

export default App;
