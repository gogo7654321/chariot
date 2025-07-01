import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
};

export const ApChemIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-red-500", className)}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m14.5 9.5-5 5" />
    <path d="m9.5 9.5 5 5" />
    <path d="M12 8v8" />
    <path d="m16 12-8 0" />
  </svg>
);

export const ApUsHistoryIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-blue-600", className)}
  >
    <path d="M12 2L4.5 5v3.5C4.5 16.5 12 22 12 22s7.5-5.5 7.5-13.5V5L12 2z" />
    <path d="M8 11.5l2 2 4-4" />
  </svg>
);

export const ApBiologyIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-green-500", className)}
  >
    <path d="M2 22a8 8 0 1 1 16 0h-4a4 4 0 1 0-8 0H2Z" />
    <path d="M10 14a2 2 0 1 0 4 0" />
    <path d="M12 12v-6a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v2" />
  </svg>
);

export const ApLangIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("text-purple-500", className)}
  >
    <path d="M4 19.5a2.5 2.5 0 0 1 0-5.01V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8.5a2.5 2.5 0 0 1 0 5.01H4zM8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

export const ApDefaultIcon = ({ className }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-gray-500", className)}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  );
