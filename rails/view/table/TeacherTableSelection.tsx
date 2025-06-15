'use client';

import { useState } from 'react';
import { useAdmin } from '@/providers/AdminProvider';
import { TeacherType } from '@/rails/model/TeacherModel';
import { DrizzleData } from '@/rails/types';
import { X } from 'lucide-react';

interface TeacherTableSelectionProps {
    selectedTeacher: DrizzleData<TeacherType> | null;
    onTeacherSelectionChange: (teacher: DrizzleData<TeacherType> | null) => void;
}

export function TeacherTableSelection({
    selectedTeacher,
    onTeacherSelectionChange
}: TeacherTableSelectionProps) {
    const { teachersData } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');
    const [isTableCollapsed, setIsTableCollapsed] = useState(false);

    const filteredTeachers = teachersData.filter(teacherData => {
        if (!searchTerm) return true;
        const teacher = teacherData.model;
        const searchLower = searchTerm.toLowerCase();
        return [
            teacher.name,
            teacher.email,
            teacher.phone,
            teacher.teacher_role,
            ...(teacher.languages || [])
        ].some(field => 
            field?.toLowerCase().includes(searchLower)
        );
    });

    const handleTeacherSelect = (teacherData: DrizzleData<TeacherType>) => {
        // Toggle selection - if same teacher is clicked, deselect
        if (selectedTeacher?.model.id === teacherData.model.id) {
            onTeacherSelectionChange(null);
            setIsTableCollapsed(false);
        } else {
            onTeacherSelectionChange(teacherData);
            setIsTableCollapsed(true);
        }
    };

    const handleReopenTable = () => {
        setIsTableCollapsed(false);
    };

    // Summary Card Component
    const TeacherSummaryCard = ({ teacherData }: { teacherData: DrizzleData<TeacherType> }) => {
        const teacher = teacherData.model;
        return (
            <div className="border border-border rounded-lg p-6 bg-card">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-card-foreground">
                        Selected Teacher
                    </h4>
                    <button
                        type="button"
                        onClick={handleReopenTable}
                        className="px-3 py-1.5 text-sm font-medium rounded-md border border-border text-muted-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        Change Teacher
                    </button>
                </div>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground">
                            {teacher.name || 'Unnamed Teacher'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {teacher.teacher_role || 'Teacher'}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                        <div>
                            <div className="text-xs text-muted-foreground">Languages</div>
                            <div className="text-sm font-medium">
                                {teacher.languages && teacher.languages.length > 0 
                                    ? teacher.languages.join(', ')
                                    : 'Not specified'
                                }
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Contact</div>
                            <div className="text-sm font-medium">
                                {teacher.email || teacher.phone || 'Not provided'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Show summary card when teacher is selected and table is collapsed */}
            {isTableCollapsed && selectedTeacher ? (
                <div className="animate-in slide-in-from-top-4 duration-300 ease-out">
                    <TeacherSummaryCard teacherData={selectedTeacher} />
                </div>
            ) : (
                /* Table View */
                <div className="animate-in slide-in-from-bottom-4 duration-300 ease-out">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="h-6 w-6 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    title="Clear search"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                            
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Select Teacher (Optional)
                            </h4>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {filteredTeachers.length} teachers
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search teachers by name, role, or language..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Teacher List */}
                    <div className="border border-border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 sticky top-0">
                                <tr>
                                    <th className="text-left p-3 text-sm font-medium">Teacher</th>
                                    <th className="text-left p-3 text-sm font-medium">Role</th>
                                    <th className="text-left p-3 text-sm font-medium">Languages</th>
                                    <th className="text-left p-3 text-sm font-medium">Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeachers && filteredTeachers.length > 0 ? (
                                    filteredTeachers.map((teacherData) => {
                                        const teacher = teacherData.model;
                                        const isSelected = selectedTeacher?.model.id === teacher.id;

                                        return (
                                            <tr
                                                key={teacher.id}
                                                className={`border-t border-border transition-all duration-200 ease-in-out cursor-pointer hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                                    isSelected
                                                        ? 'bg-primary/10 border-l-4 border-l-primary'
                                                        : ''
                                                }`}
                                                onClick={() => handleTeacherSelect(teacherData)}
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        handleTeacherSelect(teacherData);
                                                    }
                                                }}
                                            >
                                                <td className="p-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                            isSelected 
                                                                ? 'bg-primary border-primary' 
                                                                : 'border-border'
                                                        }`}>
                                                            {isSelected && (
                                                                <span className="text-primary-foreground text-xs">●</span>
                                                            )}
                                                        </div>
                                                        <span className="font-medium">
                                                            {teacher.name || 'Unnamed Teacher'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-sm">
                                                    <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md">
                                                        {teacher.teacher_role || 'Teacher'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm">
                                                    <div className="flex flex-wrap gap-1">
                                                        {teacher.languages && teacher.languages.length > 0 ? (
                                                            teacher.languages.map((lang, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md"
                                                                >
                                                                    {lang}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">No languages</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-sm text-muted-foreground">
                                                    <div className="space-y-1">
                                                        {teacher.email && (
                                                            <div className="truncate max-w-32">{teacher.email}</div>
                                                        )}
                                                        {teacher.phone && (
                                                            <div className="text-xs">{teacher.phone}</div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                            No teachers found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}