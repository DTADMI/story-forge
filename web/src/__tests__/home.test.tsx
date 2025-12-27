import {render, screen} from '@testing-library/react';
import HomePage from '@/app/page';

describe('HomePage', () => {
    it('renders marketing headline and links', () => {
        render(<HomePage/>);
        expect(
            screen.getByRole('heading', {level: 1, name: /storyforge/i})
        ).toBeInTheDocument();
        expect(screen.getByRole('link', {name: /sign in/i})).toHaveAttribute(
            'href',
            '/signin'
        );
        expect(screen.getByRole('link', {name: /pricing/i})).toHaveAttribute(
            'href',
            '/pricing'
        );
        expect(screen.getByRole('link', {name: /public feed/i})).toHaveAttribute(
            'href',
            '/feed'
        );
    });
});
