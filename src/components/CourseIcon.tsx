import { ApBiologyIcon, ApChemIcon, ApDefaultIcon, ApLangIcon, ApUsHistoryIcon } from "@/components/icons/ApIcons";
import type { SVGProps } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const iconComponentMap = {
  ApUsHistoryIcon,
  ApChemIcon,
  ApBiologyIcon,
  ApLangIcon,
  ApDefaultIcon,
};

type CourseIconProps = SVGProps<SVGSVGElement> & {
  iconName: string;
};

export function CourseIcon({ iconName, className, ...props }: CourseIconProps) {
  // Check if it's a known component key
  if (iconName in iconComponentMap) {
    const IconComponent = iconComponentMap[iconName as keyof typeof iconComponentMap];
    return <IconComponent className={className} {...props} />;
  }

  // Check if it's an image path
  if (iconName.startsWith('/')) {
    return (
      <div className={cn("relative", className)}>
        <Image src={iconName} alt="Course Icon" fill style={{ objectFit: 'contain' }} sizes="(max-width: 768px) 10vw, 5vw" />
      </div>
    );
  }

  // Regex to test for emoji characters.
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;
  if (emojiRegex.test(iconName)) {
    // Applying a sensible default font size. The container's h/w classes will determine the box size.
    return <span className={cn("flex items-center justify-center text-3xl", className)}>{iconName}</span>;
  }
  
  // Fallback to default icon component
  return <ApDefaultIcon className={className} {...props} />;
}
