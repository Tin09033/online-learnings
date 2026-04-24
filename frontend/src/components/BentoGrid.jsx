import { motion } from 'framer-motion';

/**
 * BentoGrid component for creating modular, high-density layouts.
 */
export const BentoGrid = ({ children, className = "" }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[180px] ${className}`}>
      {children}
    </div>
  );
};

/**
 * BentoCell component for individual grid items.
 */
export const BentoCell = ({ 
  children, 
  className = "", 
  colSpan = 1, 
  rowSpan = 1,
  title,
  subtitle,
  icon,
  onClick,
  delay = 0
}) => {
  const spans = {
    col: {
      1: 'md:col-span-1',
      2: 'md:col-span-2',
      3: 'lg:col-span-3',
      4: 'lg:col-span-4',
    },
    row: {
      1: 'row-span-1',
      2: 'row-span-2',
      3: 'row-span-3',
      4: 'row-span-4',
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.23, 1, 0.32, 1] 
      }}
      viewport={{ once: true }}
      whileHover={onClick ? { y: -4, scale: 1.01 } : {}}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-[2rem] p-8
        card-premium-raised shadow-premium-sm hover:shadow-premium-lg
        border border-gray-100 dark:border-gray-800
        transition-all duration-500 group
        ${spans.col[colSpan] || ''} 
        ${spans.row[rowSpan] || ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary-500/5 blur-[60px] rounded-full group-hover:bg-primary-500/10 transition-colors duration-500" />
      
      <div className="relative h-full flex flex-col">
        {(icon || title) && (
          <div className="flex items-start justify-between mb-4">
            <div>
              {title && <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h3>}
              {subtitle && <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wider">{subtitle}</p>}
            </div>
            {icon && (
              <div className="p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl group-hover:bg-primary-gradient group-hover:text-white transition-all duration-500 shadow-dual-sm">
                {icon}
              </div>
            )}
          </div>
        )}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </motion.div>
  );
};
