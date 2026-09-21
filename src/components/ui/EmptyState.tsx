import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}) => (
  <div className="surface-panel flex flex-col items-start gap-3 p-8">
    <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
    <p className="max-w-md text-muted-foreground">{description}</p>
    {actionLabel && actionTo && (
      <Button asChild className="mt-2">
        <Link to={actionTo}>{actionLabel}</Link>
      </Button>
    )}
    {actionLabel && onAction && !actionTo && (
      <Button className="mt-2" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;
