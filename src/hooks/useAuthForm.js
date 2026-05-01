import { useState } from 'react'

export function useAuthForm(initialState) {
  const [values, setValues] = useState(initialState)
  const [errors, setErrors] = useState({})

  const updateValue = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  return {
    errors,
    setErrors,
    setValues,
    updateValue,
    values,
  }
}
