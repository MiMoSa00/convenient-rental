declare module 'framer-motion' {
  import * as React from 'react';

  export type Variants = {
    [key: string]: {
      [key: string]: any;
    };
  };

  export type Transition = {
    duration?: number;
    delay?: number;
    ease?: number[] | string | ((t: number) => number);
    type?: string;
    stiffness?: number;
    damping?: number;
    mass?: number;
    velocity?: number;
    [key: string]: any;
  };

  export interface MotionProps {
    variants?: Variants;
    initial?: string | boolean | Variants[keyof Variants];
    animate?: string | boolean | Variants[keyof Variants];
    exit?: string | boolean | Variants[keyof Variants];
    transition?: Transition;
    whileHover?: any;
    whileTap?: any;
    whileInView?: any;
    viewport?: any;
    [key: string]: any;
  }

  export const motion: {
    div: React.ForwardRefExoticComponent<MotionProps & React.RefAttributes<HTMLDivElement>>;
    span: React.ForwardRefExoticComponent<MotionProps & React.RefAttributes<HTMLSpanElement>>;
    [key: string]: any;
  };

  export function AnimatePresence(props: any): React.ReactElement;
  
  export interface LazyMotionProps {
    children: React.ReactNode;
    features: any;
    strict?: boolean;
  }

  export function LazyMotion(props: LazyMotionProps): React.ReactElement;
  export const domAnimation: any;
  export const m: typeof motion;
}
