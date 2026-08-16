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
  Divider,
  MenuItem
} from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined'

import './App.css'

const TEAM_MEMBERS = [
  'Nicholas Santiago',
  'George Limbrick',
  'Aaron Carson',
  'Quinton Jones'
]

const SUBMITTED_BY_STORAGE_KEY = 'lwd_submitted_by'

function App() {

  const [formData, setFormData] = useState({
    submittedBy: localStorage.getItem(SUBMITTED_BY_STORAGE_KEY) || '',
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
    fireAffected: '',
    consultedOnOptions: '',
    planningToRebuild: '',
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

    if (!data.submittedBy.trim()) {
      newErrors.submittedBy = 'Please select who is submitting this lead'
    }

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

    if (!data.fireAffected) {
      newErrors.fireAffected = 'Please select yes or no'
    }
    if (!data.consultedOnOptions) {
      newErrors.consultedOnOptions = 'Please select yes or no'
    }
    if (!data.planningToRebuild) {
      newErrors.planningToRebuild = 'Please select yes or no'
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
      localStorage.setItem(SUBMITTED_BY_STORAGE_KEY, formData.submittedBy)
      setFormData({
        submittedBy: formData.submittedBy,
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
        fireAffected: '',
        consultedOnOptions: '',
        planningToRebuild: '',
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

  const sectionHeading = (Icon, label) => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(13,33,73,0.06)',
          color: 'primary.main'
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Typography variant="subtitle1">{label}</Typography>
    </Stack>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Box
        className="card-header"
        sx={{
          background: 'linear-gradient(135deg, #0d2149 0%, #16305e 60%, #1c3568 100%)',
          color: 'primary.contrastText',
          py: { xs: 3, sm: 4 },
          borderBottom: '3px solid',
          borderColor: 'secondary.main',
          boxShadow: '0 4px 20px rgba(13,33,73,0.25)'
        }}
      >
        <Box
          sx={{
            width: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
            maxWidth: '1400px',
            mx: 'auto'
          }}
        >
          <Typography variant="h6" align="center" sx={{ fontWeight: 800, letterSpacing: '0.03em' }}>
            Legacy West Development
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
          elevation={4}
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
                {sectionHeading(BadgeOutlinedIcon, 'Submitted By')}
                <TextField
                  select
                  label="Team Member"
                  name="submittedBy"
                  value={formData.submittedBy}
                  onChange={handleChange}
                  error={Boolean(errors.submittedBy)}
                  helperText={errors.submittedBy}
                  required
                  fullWidth
                  sx={{ maxWidth: { sm: 360 } }}
                >
                  {TEAM_MEMBERS.map((member) => (
                    <MenuItem key={member} value={member}>
                      {member}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Divider />

              <Box>
                {sectionHeading(PersonOutlineIcon, 'Contact Information')}
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
                {sectionHeading(HomeWorkOutlinedIcon, 'Property Address')}
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
                {sectionHeading(BuildOutlinedIcon, 'Project Details')}
                <Stack spacing={2.5}>
                  {radioQuestion('Do you want to increase the size of your old home?', 'increaseSize')}
                  {radioQuestion('Have you started Plans and Engineering?', 'startedPlans')}
                  {radioQuestion('Would you like to add an ADU to your property?', 'addADU')}
                  {radioQuestion('Would you like to add a Back up Generator to your property?', 'addGenerator')}
                </Stack>
              </Box>

              <Divider />

              <Box>
                {sectionHeading(LocalFireDepartmentOutlinedIcon, 'Altadena Fire Recovery')}
                <Stack spacing={2.5}>
                  {radioQuestion('Was your property affected by the Altadena fires?', 'fireAffected')}
                  {radioQuestion('Has anyone taken the time to walk you through your rebuilding options?', 'consultedOnOptions')}
                  {radioQuestion('Are you hoping to rebuild and restore your home in Altadena?', 'planningToRebuild')}
                </Stack>
              </Box>

              <Divider />

              <Box>
                {sectionHeading(NotesOutlinedIcon, 'Additional Notes')}
                <TextField
                  label="Additional Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  minRows={3}
                  fullWidth
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={status.submitting}
                endIcon={!status.submitting && <SendRoundedIcon />}
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
          &copy; {new Date().getFullYear()} Legacy West Development. All rights reserved.
        </Typography>
      </Box>
    </Box>
  )
}

export default App
