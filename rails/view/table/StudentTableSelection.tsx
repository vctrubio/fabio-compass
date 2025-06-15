'use client';

import { useState } from 'react';
import { useAdmin } from '@/providers/AdminProvider';
import { StudentType } from '@/rails/model/StudentModel';
import { X } from 'lucide-react';

interface StudentTableSelectionProps {
    selectedStudentIds: string[];
    onStudentSelectionChange: (selectedIds: string[]) => void;
    capacity?: number;
}

export function StudentTableSelection({
    selectedStudentIds,
    onStudentSelectionChange,
    capacity = 0
}: StudentTableSelectionProps) {
    const { studentsData } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');

    const students = studentsData.map(student => student.model);

    const filteredStudents = students.filter(student => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return [
            student.name,
            student.email,
            student.phone,
            ...(student.languages || [])
        ].some(field => 
            field?.toLowerCase().includes(searchLower)
        );
    });

    const handleStudentToggle = (studentId: string) => {
        const isSelected = selectedStudentIds.includes(studentId);
        
        if (isSelected) {
            // Remove student
            onStudentSelectionChange(selectedStudentIds.filter(id => id !== studentId));
        } else {
            // Add student if under capacity
            if (selectedStudentIds.length < capacity) {
                onStudentSelectionChange([...selectedStudentIds, studentId]);
            }
        }
    };

    const clearSelection = () => {
        onStudentSelectionChange([]);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
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
                        Select Students ({selectedStudentIds.length}/{capacity})
                    </h4>
                </div>
                
                {selectedStudentIds.length > 0 && (
                    <button
                        type="button"
                        onClick={clearSelection}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Clear Selection
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search students by name, email, or language..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            {/* Student List */}
            <div className="border border-border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full">
                    <thead className="bg-muted/50 sticky top-0">
                        <tr>
                            <th className="text-left p-3 text-sm font-medium">Student</th>
                            <th className="text-left p-3 text-sm font-medium">Languages</th>
                            <th className="text-left p-3 text-sm font-medium">Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents && filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => {
                                const isSelected = selectedStudentIds.includes(student.id);
                                const canSelect = !isSelected && selectedStudentIds.length < capacity;
                                const isDisabled = !isSelected && !canSelect;

                                return (
                                    <tr
                                        key={student.id}
                                        className={`border-t border-border transition-all duration-200 ease-in-out ${
                                            isDisabled 
                                                ? 'opacity-50 cursor-not-allowed' 
                                                : 'cursor-pointer hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20'
                                        } ${
                                            isSelected
                                                ? 'bg-primary/10 border-l-4 border-l-primary'
                                                : ''
                                        }`}
                                        onClick={() => !isDisabled && handleStudentToggle(student.id)}
                                        tabIndex={isDisabled ? -1 : 0}
                                        onKeyDown={(e) => {
                                            if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                                                e.preventDefault();
                                                handleStudentToggle(student.id);
                                            }
                                        }}
                                    >
                                        <td className="p-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                                    isSelected 
                                                        ? 'bg-primary border-primary' 
                                                        : 'border-border'
                                                }`}>
                                                    {isSelected && (
                                                        <span className="text-primary-foreground text-xs">✓</span>
                                                    )}
                                                </div>
                                                <span className="font-medium">
                                                    {student.name || 'Unnamed Student'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-sm">
                                            <div className="flex flex-wrap gap-1">
                                                {student.languages && student.languages.length > 0 ? (
                                                    student.languages.map((lang, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
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
                                                {student.email && (
                                                    <div className="truncate max-w-32">{student.email}</div>
                                                )}
                                                {student.phone && (
                                                    <div className="text-xs">{student.phone}</div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                    No students found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Selection Summary */}
            {selectedStudentIds.length > 0 && (
                <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium mb-2">
                        Selected Students ({selectedStudentIds.length}/{capacity}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedStudentIds.map(studentId => {
                            const student = students.find(s => s.id === studentId);
                            return (
                                <span
                                    key={studentId}
                                    className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md flex items-center gap-1"
                                >
                                    {student?.name || 'Unknown'}
                                    <button
                                        type="button"
                                        onClick={() => handleStudentToggle(studentId)}
                                        className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}