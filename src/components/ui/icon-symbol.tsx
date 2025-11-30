import { MaterialIcons } from '@expo/vector-icons';
import { type IconProps } from '@expo/vector-icons/build/createIconSet';
import { type ComponentProps } from 'react';

export function IconSymbol({ name, size, color, ...rest }: IconProps<ComponentProps<typeof MaterialIcons>['name']>) {
  return <MaterialIcons size={size} name={name as any} color={color} {...rest} />;
}
