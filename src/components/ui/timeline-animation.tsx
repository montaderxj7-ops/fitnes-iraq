"use client";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface TimelineContentProps extends HTMLMotionProps<any> {
  children: React.ReactNode;
  animationNum?: number;
  timelineRef?: React.RefObject<any>;
  customVariants?: any;
  className?: string;
  as?: React.ElementType | string;
}

export function TimelineContent({
  children,
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
  as = "div",
  ...props
}: TimelineContentProps) {
  const MotionComponent = as === "p" ? motion.p : as === "span" ? motion.span : motion.div;
  
  return (
    <MotionComponent
      custom={animationNum}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, root: timelineRef }}
      variants={customVariants}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}
