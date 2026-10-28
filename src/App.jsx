import { useState, useEffect, useMemo } from 'react'
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
  Checkbox,
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
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ConstructionOutlinedIcon from '@mui/icons-material/ConstructionOutlined'

import './App.css'

const TEAM_MEMBERS = [
  'Nicholas Santiago',
  'George Limbrick',
  'William J. Johnson',
  'Quinton Jones'
]

const SUBMITTED_BY_STORAGE_KEY = 'lwd_submitted_by'

// Converts a name to a URL-friendly slug for QR-code links, e.g.
// "Nicholas Santiago" -> "nicholas-santiago"
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')

// Reverse lookup: slug -> full team member name, used to match the
// "?rep=" query param from a rep's personal QR code to a TEAM_MEMBERS entry.
const REP_SLUG_MAP = TEAM_MEMBERS.reduce((map, member) => {
  map[slugify(member)] = member
  return map
}, {})

function App() {

  // If this page was opened via a rep's personal QR code (e.g.
  // ?rep=nicholas-santiago), auto-fill and lock the "Submitted By" field.
  const repFromQrCode = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const repParam = params.get('rep')
    if (!repParam) return null
    return REP_SLUG_MAP[slugify(repParam)] || null
  }, [])

  const [formData, setFormData] = useState({
    submittedBy: repFromQrCode || localStorage.getItem(SUBMITTED_BY_STORAGE_KEY) || '',
    name: '',
    phone: '',
    email: '',
    smsConsent: false,
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
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
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

    if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!data.smsConsent) {
      newErrors.smsConsent = 'SMS consent is required to submit this form'
    }

    if (data.addressState.trim() && !/^[A-Za-z]{2}$/.test(data.addressState.trim())) {
      newErrors.addressState = 'Use 2-letter state code'
    }
    if (data.addressZip.trim() && !/^\d{5}(-\d{4})?$/.test(data.addressZip.trim())) {
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
        smsConsent: false,
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
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d2149 0%, #4e79e1 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 10px rgba(13,33,73,0.25)'
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
        className="hero"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(120deg, #081530 0%, #0d2149 45%, #3a5cb0 100%)',
          color: '#ffffff',
          pb: { xs: 10, sm: 12 },
          pt: { xs: 'calc(env(safe-area-inset-top, 0px) + 24px)', sm: 'calc(env(safe-area-inset-top, 0px) + 40px)' }
        }}
      >
        <Box className="hero-shape hero-shape-1" />
        <Box className="hero-shape hero-shape-2" />
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
            maxWidth: '1400px',
            mx: 'auto'
          }}
        >
          <Box
            component="img"
            src="/lwd-logo.webp"
            alt="Legacy West Development"
            sx={{
              display: 'block',
              mx: 'auto',
              height: { xs: 48, sm: 60 },
              width: 'auto',
              mb: { xs: 3, sm: 4 },
              filter: 'brightness(0) invert(1)'
            }}
          />
          <Typography
            variant="h3"
            align="center"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.9rem', sm: '2.6rem', md: '3rem' },
              lineHeight: 1.15,
              mb: 2
            }}
          >
            Build the Property Your Legacy Deserves
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{
              maxWidth: 640,
              mx: 'auto',
              color: 'rgba(255,255,255,0.82)',
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              mb: { xs: 4, sm: 5 }
            }}
          >
            From ADUs to full rebuilds, tell us about your project and a member of our team will reach out
            within 24 hours to map out your next steps.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 2 }}
            justifyContent="center"
            alignItems="stretch"
            sx={{ maxWidth: 900, mx: 'auto' }}
          >
            {[
              { icon: VerifiedOutlinedIcon, title: 'CSLB #1148175', subtitle: 'Licensed & Insured' },
              { icon: PhoneInTalkOutlinedIcon, title: '(626) 720-3091', subtitle: 'Call Us Directly' },
              { icon: AccessTimeOutlinedIcon, title: '24-Hour', subtitle: 'Response Guarantee' }
            ].map(({ icon: Icon, title, subtitle }) => (
              <Box
                key={title}
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  backdropFilter: 'blur(6px)'
                }}
              >
                <Icon sx={{ color: '#7a9aea' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.72)' }}>
                    {subtitle}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          width: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
          maxWidth: '1400px',
          mx: 'auto',
          mt: { xs: -7, sm: -8 },
          pb: { xs: 4, sm: 6 },
          flexGrow: 1,
          position: 'relative',
          zIndex: 2
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 5 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(13,33,73,0.18)'
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <ConstructionOutlinedIcon sx={{ color: 'secondary.main' }} />
              <Typography variant="h5" component="h1" sx={{ fontWeight: 800 }}>
                Tell Us About Your Project
              </Typography>
            </Stack>
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
                  helperText={
                    errors.submittedBy ||
                    (repFromQrCode ? `Auto-filled from ${repFromQrCode}'s QR code` : undefined)
                  }
                  required
                  fullWidth
                  disabled={Boolean(repFromQrCode)}
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
                      fullWidth
                    />
                  </Stack>

                  <FormControl error={Boolean(errors.smsConsent)} required>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="smsConsent"
                          checked={formData.smsConsent}
                          onChange={handleChange}
                        />
                      }
                      label={
                        <Typography variant="body2" color="text.secondary">
                          I consent to receive text messages from Legacy West Development regarding my project.
                          Message frequency varies. Message and data rates may apply. Reply STOP to opt out at any
                          time. View our{' '}
                          <a
                            href="https://legacywestdevelopment.com/privacy"
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'inherit' }}
                          >
                            Privacy Policy
                          </a>.
                        </Typography>
                      }
                    />
                    {errors.smsConsent && <FormHelperText>{errors.smsConsent}</FormHelperText>}
                  </FormControl>
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
                      fullWidth
                    />
                    <TextField
                      label="State"
                      name="addressState"
                      value={formData.addressState}
                      onChange={handleChange}
                      error={Boolean(errors.addressState)}
                      helperText={errors.addressState}
                      fullWidth
                    />
                    <TextField
                      label="Zip Code"
                      name="addressZip"
                      value={formData.addressZip}
                      onChange={handleChange}
                      error={Boolean(errors.addressZip)}
                      helperText={errors.addressZip}
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

              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={status.submitting}
                  endIcon={!status.submitting && <SendRoundedIcon />}
                  className="submit-btn"
                  sx={{
                    py: 1.6,
                    alignSelf: { xs: 'stretch', sm: 'flex-start' },
                    px: 6,
                    fontSize: '1rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #0d2149 0%, #4e79e1 100%)',
                    boxShadow: '0 10px 24px rgba(13,33,73,0.28)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #081530 0%, #3a5cb0 100%)',
                      boxShadow: '0 14px 30px rgba(13,33,73,0.35)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {status.submitting ? 'Submitting...' : 'Submit My Project'}
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  No obligation — a team member will reach out within 24 hours.
                </Typography>
              </Box>

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
        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
          177 E. Colorado Blvd, Suite 200, Pasadena, CA 91105 &nbsp;|&nbsp; (626) 720-3091 &nbsp;|&nbsp; CSLB #1148175
        </Typography>
        <Typography variant="caption">
          &copy; {new Date().getFullYear()} Legacy West Development. All rights reserved.
        </Typography>
      </Box>
    </Box>
  )
}

export default App
