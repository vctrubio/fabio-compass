'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HelmetIcon } from '@/assets/svg/HelmetIcon';
import { HeadsetIcon } from '@/assets/svg/HeadsetIcon';
import { UsersIcon } from '@/assets/svg/UsersIcon';
import usersConfig from '@/config/users-credentials.json';

// Icon mapping
const ICON_MAP = {
    HelmetIcon,
    HeadsetIcon,
    UsersIcon
} as const;

// Convert users config to role configs format
const ROLE_CONFIGS = Object.fromEntries(
    Object.entries(usersConfig).map(([key, user]) => [
        key,
        {
            Icon: ICON_MAP[user.icon as keyof typeof ICON_MAP],
            label: user.label,
            color: user.color,
            route: user.route
        }
    ])
);

// Connection colors between roles
const CONNECTION_COLORS = {
    studentTeacher: "text-blue-500 dark:text-blue-400",
    studentAdmin: "text-green-500 dark:text-green-400", 
    teacherAdmin: "text-purple-500 dark:text-purple-400"
} as const;

// Convert role configs to array for iteration
const ROLE_ICONS = [
    ROLE_CONFIGS.student,
    ROLE_CONFIGS.teacher,
    ROLE_CONFIGS.admin
] as const;

interface CompassSVGProps {
    className?: string;
    isLoading?: boolean;
}

function CompassSVG({ className = "", isLoading = false }: CompassSVGProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${className} ${isLoading ? 'animate-spin' : ''} transition-transform duration-300 drop-shadow-sm`}
        >
            {/* Outer compass ring */}
            <circle cx="12" cy="12" r="10" className="stroke-current opacity-40" strokeWidth="2" />

            {/* Inner compass ring */}
            <circle cx="12" cy="12" r="8" className="stroke-current opacity-20" strokeWidth="1" />

            {/* Compass markings - 12 equally spaced marks around the circle */}
            <g className="stroke-current opacity-60">
                {/* Main cardinal directions (longer marks) */}
                <line x1="12" y1="2" x2="12" y2="4" strokeWidth="2" />
                <line x1="22" y1="12" x2="20" y2="12" strokeWidth="2" />
                <line x1="12" y1="22" x2="12" y2="20" strokeWidth="2" />
                <line x1="2" y1="12" x2="4" y2="12" strokeWidth="2" />

                {/* Diagonal directions (medium marks) */}
                <line x1="17.66" y1="6.34" x2="16.95" y2="7.05" strokeWidth="1.5" />
                <line x1="17.66" y1="17.66" x2="16.95" y2="16.95" strokeWidth="1.5" />
                <line x1="6.34" y1="17.66" x2="7.05" y2="16.95" strokeWidth="1.5" />
                <line x1="6.34" y1="6.34" x2="7.05" y2="7.05" strokeWidth="1.5" />
            </g>

            {/* Compass needle - points north */}
            <g>
                <path d="M12 4 L13.5 10 L12 9 L10.5 10 Z" fill="currentColor" className="text-red-500 dark:text-red-400" />
                <path d="M12 20 L10.5 14 L12 15 L13.5 14 Z" fill="currentColor" className="opacity-60" />
            </g>

            {/* Center dot */}
            <circle cx="12" cy="12" r="1.5" fill="currentColor" className="opacity-80" />
        </svg>
    );
}

interface FooterCardProps {
    appName: string;
    description: string;
    poweredByComponent?: React.ReactNode;
    className?: string;
}

export default function WWD({
    appName,
    className = ""
}: FooterCardProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredIcon, setHoveredIcon] = useState<number | null>(null);
    const router = useRouter();

    const handleIconClick = (route: string) => {
        router.push(route);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800); // Much shorter timeout - just show compass spinners briefly

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`bg-transparent border-0 p-6 sm:p-8 w-full max-w-md mx-auto ${className}`}>
            {/* Logo and Title */}
            <div className="flex flex-col text-center mb-6">
                {isLoading ? (
                    /* 3 Loading Compass Spinners in Triangle Pattern */
                    <div className="relative flex flex-col items-center gap-12 mb-8 py-8">
                        {/* Top row - 2 compass spinners */}
                        <div className="flex gap-16 relative z-10">
                            {[0, 1].map((index) => (
                                <div key={index} className="flex justify-center">
                                    <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl shadow-inner">
                                        <CompassSVG
                                            className="h-10 w-10 text-slate-600 dark:text-slate-300"
                                            isLoading={true}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom row - 1 compass spinner */}
                        <div className="flex justify-center relative z-10">
                            <div className="flex justify-center">
                                <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl shadow-inner">
                                    <CompassSVG
                                        className="h-10 w-10 text-slate-600 dark:text-slate-300"
                                        isLoading={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Desktop: Triangle Pattern with Connecting Lines */}
                        <div className="hidden md:block relative">
                            <div className="relative flex flex-col items-center gap-12 mb-8 py-8">
                                {/* SVG for connecting lines */}
                                <svg
                                    className="absolute inset-0 w-full h-full pointer-events-none"
                                    viewBox="0 0 200 120"
                                    preserveAspectRatio="xMidYMid meet"
                                >
                                    {/* Lines between icons - only show based on hover state */}
                                    {/* Top-left to Top-right line */}
                                    {(hoveredIcon === 0 || hoveredIcon === 1) && (
                                        <line
                                            x1="50"
                                            y1="30"
                                            x2="150"
                                            y2="30"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className={`${CONNECTION_COLORS.studentTeacher} opacity-60 animate-pulse`}
                                            strokeDasharray="4 4"
                                        />
                                    )}

                                    {/* Top-left to Bottom-center line */}
                                    {(hoveredIcon === 0 || hoveredIcon === 2) && (
                                        <line
                                            x1="50"
                                            y1="30"
                                            x2="100"
                                            y2="90"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className={`${CONNECTION_COLORS.studentAdmin} opacity-60 animate-pulse`}
                                            strokeDasharray="4 4"
                                        />
                                    )}

                                    {/* Top-right to Bottom-center line */}
                                    {(hoveredIcon === 1 || hoveredIcon === 2) && (
                                        <line
                                            x1="150"
                                            y1="30"
                                            x2="100"
                                            y2="90"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className={`${CONNECTION_COLORS.teacherAdmin} opacity-60 animate-pulse`}
                                            strokeDasharray="4 4"
                                        />
                                    )}
                                </svg>

                                {/* Top row - 2 icons */}
                                <div className="flex gap-20 relative z-10">
                                    {ROLE_ICONS.slice(0, 2).map(({ Icon, label, color, route }, index) => (
                                        <div
                                            key={label}
                                            className={`flex items-center gap-4 cursor-pointer ${index === 0 ? 'flex-row-reverse' : 'flex-row'}`}
                                            onMouseEnter={() => setHoveredIcon(index)}
                                            onMouseLeave={() => setHoveredIcon(null)}
                                            onClick={() => handleIconClick(route)}
                                        >
                                            <div className={`p-5 border-2 ${color} bg-transparent rounded-xl shadow-inner transition-all duration-300 ${hoveredIcon === index ? `shadow-lg ring-2 ring-current/50` : ''
                                                }`}>
                                                <Icon className="h-12 w-12 text-slate-700 dark:text-slate-200" />
                                            </div>
                                            <span className="text-2xl font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                {label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Bottom row - 1 centered icon */}
                                <div className="flex justify-center relative z-10">
                                    {ROLE_ICONS.slice(2).map(({ Icon, label, color, route }) => (
                                        <div
                                            key={label}
                                            className="flex flex-col items-center gap-2 cursor-pointer"
                                            onMouseEnter={() => setHoveredIcon(2)}
                                            onMouseLeave={() => setHoveredIcon(null)}
                                            onClick={() => handleIconClick(route)}
                                        >
                                            <div className={`p-5 border-2 ${color} bg-transparent rounded-xl shadow-inner transition-all duration-300 ${hoveredIcon === 2 ? `shadow-lg ring-2 ring-current/50` : ''
                                                }`}>
                                                <Icon className="h-12 w-12 text-slate-700 dark:text-slate-200" />
                                            </div>
                                            <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                                                {label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Mobile/Tablet: Row Layout */}
                        <div className="md:hidden flex flex-col gap-4 mb-8 py-4">
                            {ROLE_ICONS.map(({ Icon, label, color, route }, index) => (
                                <div
                                    key={label}
                                    className={`flex items-center gap-4 cursor-pointer p-4 border-4 ${color} bg-transparent rounded-xl transition-all duration-300 hover:shadow-lg ${hoveredIcon === index ? `ring-2 ring-current/50 shadow-lg` : ''
                                        }`}
                                    onMouseEnter={() => setHoveredIcon(index)}
                                    onMouseLeave={() => setHoveredIcon(null)}
                                    onClick={() => handleIconClick(route)}
                                >
                                    <div className="p-3 rounded-lg">
                                        <Icon className="h-8 w-8 text-slate-700 dark:text-slate-200" />
                                    </div>
                                    <span className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div>

                    {/* Subheading with decorative line */}
                    <div className="flex items-center justify-center gap-3 mb-1">
                        <div className="h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-slate-400 dark:via-slate-400 dark:to-slate-300 w-12 shadow-sm"></div>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
                            {appName}
                        </h2>
                        <div className="h-0.5 bg-gradient-to-l from-transparent via-slate-400 to-slate-500 dark:via-slate-400 dark:to-slate-300 w-12 shadow-sm"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
