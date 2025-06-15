"use client";

import { useState } from "react";
import { TeacherForm, LanguagesEnum, TeacherRoleEnum } from "@/rails/model";
import { toast } from "sonner";
import { z } from "zod";
import { createTeacherFromClient, createTeacherWithInvitation } from "@/actions/user-student-teacher-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ENTITY_CONFIGS } from "@/config/entities";

export type TeacherCreate4AdminFormData = z.infer<typeof TeacherForm>;

interface FormFieldDescriptor {
    key: keyof TeacherCreate4AdminFormData;
    label: string;
    type: 'text' | 'tel';
    required: boolean;
    placeholder?: string;
}

const FORM_FIELDS: FormFieldDescriptor[] = [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Full name' },
    { key: 'passport_number', label: 'Passport Number', type: 'text', required: false, placeholder: 'ABC123456' },
] as const;

export const TeacherCreate4Admin = ({
    onSubmit
}: {
    onSubmit?: (data: any) => void;
}) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [formData, setFormData] = useState<Partial<TeacherCreate4AdminFormData>>({
        name: '',
        passport_number: '',
        phone: '',
        country: '',
        languages: [],
        teacher_role: 'freelance',
    });
    const [email, setEmail] = useState('');

    const resetForm = () => {
        setFormData({
            name: '',
            passport_number: '',
            phone: '',
            country: '',
            languages: [],
            teacher_role: 'freelance',
        });
        setSelectedLanguages([]);
        setEmail('');
        setError(null);
    };

    // Check if form is ready to submit
    const isFormValid = () => {
        return formData.name && formData.name.trim() !== "" && selectedLanguages.length > 0;
    };

    const handleLanguageChange = (language: string, checked: boolean) => {
        if (checked) {
            setSelectedLanguages(prev => [...prev, language]);
        } else {
            setSelectedLanguages(prev => prev.filter(lang => lang !== language));
        }
    };

    const handleInputChange = (key: keyof TeacherCreate4AdminFormData, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const languages = selectedLanguages as z.infer<typeof LanguagesEnum>[];

            const data: TeacherCreate4AdminFormData = {
                name: formData.name as string,
                country: formData.country || null,
                passport_number: formData.passport_number || null,
                languages: languages,
                phone: formData.phone || null,
                teacher_role: formData.teacher_role as z.infer<typeof TeacherRoleEnum>,
            };

            console.log('Teacher data being submitted:', data);

            const validation = TeacherForm.safeParse(data);
            
            if (!validation.success) {
                const errorMessage = validation.error.errors.map((e: any) => e.message).join(', ');
                setError(errorMessage);
                return;
            }

            const validatedData = validation.data;
            console.log('Validated teacher data:', validatedData);

            let newTeacher;
            if (email && email.trim() !== "") {
                // Create teacher with invitation
                const result = await createTeacherWithInvitation(null, validatedData, email, 'pendingTeacher');
                if (!result.success) {
                    throw new Error(result.error || 'Failed to create teacher with invitation');
                }
                newTeacher = result.data?.teacher;
                toast.success(`Teacher "${validatedData.name}" created with email invitation!`, {
                    description: `Teacher ID: ${newTeacher?.id} | Email: ${email} | Role: ${validatedData.teacher_role}`,
                    duration: 4000,
                });
            } else {
                // Create teacher without invitation
                const result = await createTeacherFromClient(validatedData);
                if (!result.success) {
                    throw new Error(result.error || 'Failed to create teacher');
                }
                newTeacher = result.data;
                toast.success(`Teacher "${validatedData.name}" created successfully!`, {
                    description: `Teacher ID: ${newTeacher?.id} | Role: ${validatedData.teacher_role} | Languages: ${languages.join(', ')}`,
                    duration: 4000,
                });
            }

            resetForm();
            if (onSubmit) onSubmit(newTeacher);

        } catch (err: any) {
            console.error('Error creating teacher:', err);
            const errorMessage = err.message || "Failed to create teacher";
            setError(errorMessage);
            toast.error("Error Creating Teacher", { description: errorMessage, duration: 4000 });
        } finally {
            setIsLoading(false);
        }
    };

    const renderField = (field: FormFieldDescriptor) => {
        return (
            <div key={field.key} className="flex flex-col gap-2 min-w-fit">
                <Label htmlFor={field.key} className="text-xs font-medium whitespace-nowrap">
                    {field.label}{field.required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    required={field.required}
                    disabled={isLoading}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="h-9 w-32 text-sm"
                    placeholder={field.placeholder || field.label}
                />
            </div>
        );
    };

    return (
        <div className="w-full">

            {/* Content */}
            <div className="max-w-4xl mx-auto p-6">
                <Card className="w-full border-border/50 shadow-lg">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <ENTITY_CONFIGS.teachers.icon className="h-4 w-4 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Create Teacher</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {/* Basic Fields */}
                    <div className="flex flex-wrap gap-4">
                        {FORM_FIELDS.map(renderField)}

                        {/* Phone Input */}
                        <div className="flex flex-col gap-2 min-w-fit">
                            <Label htmlFor="phone" className="text-xs font-medium whitespace-nowrap">
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                disabled={isLoading}
                                value={formData.phone || ''}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className="h-9 w-48 text-sm"
                                placeholder="Enter phone number"
                            />
                        </div>

                        {/* Country */}
                        <div className="flex flex-col gap-2 min-w-fit">
                            <Label htmlFor="country" className="text-xs font-medium whitespace-nowrap">
                                Country
                            </Label>
                            <Input
                                id="country"
                                name="country"
                                type="text"
                                disabled={isLoading}
                                value={formData.country || ''}
                                onChange={(e) => handleInputChange('country', e.target.value)}
                                className="h-9 w-32 text-sm"
                                placeholder="Country"
                            />
                        </div>

                        {/* Teacher Role */}
                        <div className="flex flex-col gap-2 min-w-fit">
                            <Label htmlFor="teacher_role" className="text-xs font-medium whitespace-nowrap">
                                Teacher Role
                            </Label>
                            <select
                                id="teacher_role"
                                name="teacher_role"
                                disabled={isLoading}
                                value={formData.teacher_role}
                                onChange={(e) => handleInputChange('teacher_role', e.target.value)}
                                className="h-9 w-32 text-sm rounded-md border border-input bg-background px-3 py-1 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                {TeacherRoleEnum.options.map((role) => (
                                    <option key={role} value={role}>
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Languages */}
                        <div className="flex flex-col gap-2 min-w-fit">
                            <Label className="text-xs font-medium whitespace-nowrap">
                                Languages<span className="text-red-500">*</span>
                            </Label>
                            <div className="flex flex-wrap gap-2 p-2 rounded border border-input bg-background min-h-[36px] w-48">
                                {LanguagesEnum.options.map((language) => (
                                    <label 
                                        key={language} 
                                        className="flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium cursor-pointer select-none border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        <Checkbox
                                            checked={selectedLanguages.includes(language)}
                                            onCheckedChange={(checked) => handleLanguageChange(language, !!checked)}
                                            disabled={isLoading}
                                        />
                                        {language}
                                    </label>
                                ))}
                            </div>
                            {selectedLanguages.length === 0 && (
                                <span className="text-xs text-red-500">At least one language is required</span>
                            )}
                        </div>
                    </div>

                    {/* Email and Submit */}
                    <div className="flex items-end justify-end gap-3 pt-4 border-t border-border/50">
                        <div className="flex flex-col gap-2 max-w-md">
                            <Label htmlFor="email" className="text-xs font-medium text-cyan-500">
                                Email to send invitation link
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                disabled={isLoading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-9 text-sm"
                                placeholder="teacher@example.com"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || !isFormValid()}
                            className="h-9 px-6"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    Creating...
                                </span>
                            ) : (
                                '+ Create Teacher'
                            )}
                        </Button>
                    </div>
                </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};