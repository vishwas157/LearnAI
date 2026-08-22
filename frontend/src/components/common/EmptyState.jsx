import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = BookOpen,
  title = 'No items found',
  description = 'Get started by creating or exploring new content.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-4">
      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
