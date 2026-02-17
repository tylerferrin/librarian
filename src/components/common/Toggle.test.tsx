import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toggle } from './Toggle'

describe('Toggle component - Logic tests', () => {
  it('should call onChange with opposite value when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<Toggle label="Test" value={false} onChange={onChange} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('should toggle from true to false', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<Toggle label="Test" value={true} onChange={onChange} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('should display correct state text', () => {
    const { rerender } = render(
      <Toggle label="Test" value={false} onChange={() => {}} />
    )
    
    expect(screen.getByText('Off')).toBeInTheDocument()
    
    rerender(<Toggle label="Test" value={true} onChange={() => {}} />)
    
    expect(screen.getByText('On')).toBeInTheDocument()
  })

  it('should display the label', () => {
    render(<Toggle label="My Toggle" value={false} onChange={() => {}} />)
    
    expect(screen.getByText('My Toggle')).toBeInTheDocument()
  })

  it('should call onChange only once per click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<Toggle label="Test" value={false} onChange={onChange} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple clicks (controlled component)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    // Controlled component - value doesn't change unless parent updates it
    render(<Toggle label="Test" value={false} onChange={onChange} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    await user.click(button)
    await user.click(button)
    
    expect(onChange).toHaveBeenCalledTimes(3)
    // Since value stays false (controlled), all calls will be with true
    expect(onChange).toHaveBeenNthCalledWith(1, true)
    expect(onChange).toHaveBeenNthCalledWith(2, true)
    expect(onChange).toHaveBeenNthCalledWith(3, true)
  })

  it('should support different active colors', () => {
    const { rerender } = render(
      <Toggle label="Test" value={true} onChange={() => {}} activeColor="green" />
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
    
    rerender(<Toggle label="Test" value={true} onChange={() => {}} activeColor="blue" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    
    rerender(<Toggle label="Test" value={true} onChange={() => {}} activeColor="red" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    const { container } = render(
      <Toggle label="Test" value={false} onChange={() => {}} className="custom-class" />
    )
    
    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('custom-class')
  })
})
