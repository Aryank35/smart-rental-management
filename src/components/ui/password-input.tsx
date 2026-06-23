import * as React from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input, type InputProps } from './input'

/** Password field with a show/hide toggle and a default lock icon. */
const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  ({ leadingIcon, ...props }, ref) => {
    const [show, setShow] = React.useState(false)
    return (
      <Input
        ref={ref}
        type={show ? 'text' : 'password'}
        leadingIcon={leadingIcon ?? <Lock />}
        trailingIcon={
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="transition-colors hover:text-foreground"
          >
            {show ? <EyeOff /> : <Eye />}
          </button>
        }
        {...props}
      />
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
