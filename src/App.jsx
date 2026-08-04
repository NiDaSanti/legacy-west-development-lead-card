import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Alert,
  Stack,
  Divider
} from '@mui/material'

import './App.css'

function App() {

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
    increaseSize: '',
    startedPlans: '',
    addADU: '',
    addGenerator: '',
    notes: ''
  })

  const [status, setStatus] = useState({ submitting: false, error: null, success: false })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const {name, value} = e.target
    setFormData(prev => ({...prev, [name]: value}))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (data) => {
    const newErrors = {}

    if (!data.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!data.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\d\s()+-]{7,20}$/.test(data.phone.trim())) {
      newErrors.phone = 'Enter a valid phone number'
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!data.addressStreet.trim()) {
      newErrors.addressStreet = 'Street address is required'
    }
    if (!data.addressCity.trim()) {
      newErrors.addressCity = 'City is required'
    }
    if (!data.addressState.trim()) {
      newErrors.addressState = 'State is required'
    } else if (!/^[A-Za-z]{2}$/.test(data.addressState.trim())) {
      newErrors.addressState = 'Use 2-letter state code'
    }
    if (!data.addressZip.trim()) {
      newErrors.addressZip = 'Zip code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(data.addressZip.trim())) {
      newErrors.addressZip = 'Enter a valid zip code'
    }

    if (!data.increaseSize) {
      newErrors.increaseSize = 'Please select yes or no'
    }
    if (!data.startedPlans) {
      newErrors.startedPlans = 'Please select yes or no'
    }
    if (!data.addADU) {
      newErrors.addADU = 'Please select yes or no'
    }
    if (!data.addGenerator) {
      newErrors.addGenerator = 'Please select yes or no'
    }

    return newErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setStatus({ submitting: false, error: 'Please fix the highlighted fields below.', success: false })
      return
    }

    setErrors({})
    setStatus({ submitting: true, error: null, success: false })
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${apiBaseUrl}/api/create-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || 'Failed to submit lead')
      }

      setStatus({ submitting: false, error: null, success: true })
      setFormData({
        name: '',
        phone: '',
        email: '',
        addressStreet: '',
        addressCity: '',
        addressState: '',
        addressZip: '',
        increaseSize: '',
        startedPlans: '',
        addADU: '',
        addGenerator: '',
        notes: ''
      })
    } catch (err) {
      setStatus({ submitting: false, error: err.message, success: false })
    }
  }
  const radioQuestion = (label, name) => (
    <FormControl component="fieldset" error={Boolean(errors[name])} required>
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup
        row
        name={name}
        value={formData[name]}
        onChange={handleChange}
      >
        <FormControlLabel value="yes" control={<Radio />} label="Yes" />
        <FormControlLabel value="no" control={<Radio />} label="No" />
      </RadioGroup>
      {errors[name] && <FormHelperText>{errors[name]}</FormHelperText>}
    </FormControl>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Box
        className="card-header"
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: { xs: 2.5, sm: 3 },
          borderBottom: '3px solid',
          borderColor: 'secondary.main'
        }}
      >
        <Box
          sx={{
            width: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
            maxWidth: '1400px',
            mx: 'auto'
          }}
        >
          <Typography variant="h6" align="center" sx={{ fontWeight: 700, letterSpacing: '0.02em' }}>
            Legacy West
          </Typography>
          <Typography variant="body2" align="center" sx={{ opacity: 0.85, mt: 0.5 }}>
            177 E. Colorado Blvd, Suite 200, Pasadena, CA 91105 &nbsp;|&nbsp; (626) 720-3091 &nbsp;|&nbsp; CSLB #1148175
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
          maxWidth: '1400px',
          mx: 'auto',
          py: { xs: 3, sm: 5 },
          flexGrow: 1
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Project Information Form
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please complete the fields below so our team can follow up regarding your property project.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={4}>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Contact Information
                </Typography>
                <Stack spacing={2.5}>
                  <TextField
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                    required
                    fullWidth
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
                    <TextField
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      error={Boolean(errors.phone)}
                      helperText={errors.phone}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={Boolean(errors.email)}
                      helperText={errors.email}
                      required
                      fullWidth
                    />
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Property Address
                </Typography>
                <Stack spacing={2.5}>
                  <TextField
                    label="Street Address"
                    name="addressStreet"
                    value={formData.addressStreet}
                    onChange={handleChange}
                    error={Boolean(errors.addressStreet)}
                    helperText={errors.addressStreet}
                    required
                    fullWidth
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
                    <TextField
                      label="City"
                      name="addressCity"
                      value={formData.addressCity}
                      onChange={handleChange}
                      error={Boolean(errors.addressCity)}
                      helperText={errors.addressCity}
                      required
                      fullWidth
                    />
                    <TextField
                      label="State"
                      name="addressState"
                      value={formData.addressState}
                      onChange={handleChange}
                      error={Boolean(errors.addressState)}
                      helperText={errors.addressState}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Zip Code"
                      name="addressZip"
                      value={formData.addressZip}
                      onChange={handleChange}
                      error={Boolean(errors.addressZip)}
                      helperText={errors.addressZip}
                      required
                      fullWidth
                    />
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Project Details
                </Typography>
                <Stack spacing={2.5}>
                  {radioQuestion('Do you want to increase the size of your old home?', 'increaseSize')}
                  {radioQuestion('Have you started Plans and Engineering?', 'startedPlans')}
                  {radioQuestion('Would you like to add an ADU to your property?', 'addADU')}
                  {radioQuestion('Would you like to add a Back up Generator to your property?', 'addGenerator')}
                </Stack>
              </Box>

              <Divider />

              <TextField
                label="Additional Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                minRows={3}
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={status.submitting}
                sx={{ py: 1.5, alignSelf: { xs: 'stretch', sm: 'flex-start' }, px: 5 }}
              >
                {status.submitting ? 'Submitting...' : 'Submit'}
              </Button>

              {status.success && <Alert severity="success">Thank you — your information has been submitted successfully.</Alert>}
              {status.error && <Alert severity="error">{status.error}</Alert>}
            </Stack>
          </Box>
        </Paper>
      </Box>

      <Box
        component="footer"
        className="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          color: 'text.secondary',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="caption">
          &copy; {new Date().getFullYear()} Legacy West. All rights reserved.
        </Typography>
      </Box>
    </Box>
  )
}

export default App
