import {render, screen} from '@testing-library/react';
import {Button} from '@/components/ui/button';

describe('Button', () => {
  it('renders with default variant and size', () => {
    render(<Button>Click me</Button>);
    expect(
        screen.getByRole('button', {name: /click me/i})
    ).toBeInTheDocument();
  });
});
