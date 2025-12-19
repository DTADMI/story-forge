import {render, screen} from '@testing-library/react';
import PublicFeedPage from '@/app/feed/page';

describe('PublicFeedPage', () => {
    it('renders the public stories feed header', async () => {
        const ui = await PublicFeedPage();
        render(ui);
        expect(screen.getByRole('heading', {name: /public stories feed/i})).toBeInTheDocument();
    });
});
