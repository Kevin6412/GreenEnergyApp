import { cn } from '@/lib/utils';
import { Platform, TextInput, type TextInputProps } from 'react-native';

function Input({
  className,
  placeholderClassName,
  ...props
}: TextInputProps & React.RefAttributes<TextInput>) {
  return (
    <TextInput
      className={cn(
        'flex h-10 w-full min-w-0 flex-row items-center rounded-md border border-input bg-background px-3 py-1 text-base leading-5 text-foreground shadow-sm shadow-black/5 md:text-sm',
        
        'placeholder:text-muted-foreground',
        
        props.editable === false && 'opacity-50',
        
        Platform.select({
          web: cn(
            'outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground',
            'focus:border-ring focus:ring-[3px] focus:ring-ring/50',
            'aria-invalid:ring-destructive/20 aria-invalid:border-destructive'
          ),
          native: cn(
            'focus:border-ring focus:border-[2px]',
            Platform.OS === 'ios' && 'bg-background'
          ),
        }),
        
        // Dark mode consistency
        'dark:bg-input/30 dark:aria-invalid:ring-destructive/40',
        
        className
      )}
      // Ensure consistent placeholder text color on all platforms
      placeholderTextColor={Platform.select({
        ios: '#A1A1AA',
        default: undefined,
      })}
      {...props}
    />
  );
}

export { Input };
