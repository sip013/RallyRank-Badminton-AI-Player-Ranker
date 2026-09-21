import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => (
  <div className="court-lines flex min-h-screen flex-col items-center justify-center px-4 text-center">
    <h1 className="font-display text-4xl font-bold text-ink">Page not found</h1>
    <p className="mt-2 text-muted-foreground">That court doesn’t exist.</p>
    <Button asChild className="mt-6">
      <Link to="/">Back to RallyRank</Link>
    </Button>
  </div>
);

export default NotFound;
