/* eslint-disable @typescript-eslint/no-explicit-any */
import { drizzleTeachers } from "@/rails/controller/TeacherDrizzle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLanguageBadge, getRoleBadgeVariant, getRoleBadgeStyle } from "@/components/getters";

export default async function TeachersTable() {
    try {
        const teachersData = await drizzleTeachers();

        return (
            <Card>
                <CardHeader>
                    <CardTitle>All Teachers ({teachersData.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Name</th>
                                    <th className="text-left p-3">Languages</th>
                                    <th className="text-left p-3">Email / Role</th>
                                    <th className="text-left p-3">Teaching Hours</th>
                                    <th className="text-left p-3">Students</th>
                                    <th className="text-left p-3">Phone</th>
                                    <th className="text-left p-3">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachersData.map((teacherData) => {
                                    const teacher = teacherData.model;
                                    const userWallet = (teacherData.relations as any)?.userWallet;
                                    const lambdas = teacherData.lambdas as {
                                        totalTeachingHours: number;
                                        totalStudents: number;
                                        studentNames: string[];
                                    };

                                    return (
                                        <tr key={teacher.id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">
                                                <div className="font-medium">{teacher.name}</div>
                                                <div className="text-sm text-muted-foreground">{teacher.id}</div>
                                                {teacher.teacher_role && (
                                                    <Badge variant="outline" className="mt-1 text-xs">
                                                        {teacher.teacher_role}
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex flex-wrap">
                                                    {teacher.languages && teacher.languages.length > 0
                                                        ? getLanguageBadge(teacher.languages)
                                                        : <span className="text-muted-foreground">No languages</span>
                                                    }
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {userWallet?.email ? (
                                                    <div>
                                                        <div className="font-medium text-sm">{userWallet.email}</div>
                                                        {userWallet.role && (
                                                            <Badge 
                                                                variant={getRoleBadgeVariant(userWallet.role)}
                                                                style={getRoleBadgeStyle(userWallet.role)}
                                                                className="mt-1"
                                                            >
                                                                {userWallet.role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : userWallet?.role ? (
                                                    <div>
                                                        <Badge 
                                                            variant={getRoleBadgeVariant(userWallet.role)}
                                                            style={getRoleBadgeStyle(userWallet.role)}
                                                        >
                                                            {userWallet.role}
                                                        </Badge>
                                                        <div className="text-xs text-muted-foreground mt-1">Role (No Email)</div>
                                                    </div>
                                                ) : teacher.email ? (
                                                    <div className="font-medium text-sm">{teacher.email}</div>
                                                ) : (
                                                    <span className="text-muted-foreground">No email</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {lambdas.totalTeachingHours}h
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    total hours
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm font-medium">
                                                    {lambdas.totalStudents}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {lambdas.totalStudents === 1 ? 'student' : 'students'}
                                                </div>
                                                {lambdas.studentNames.length > 0 && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {lambdas.studentNames.slice(0, 2).join(', ')}
                                                        {lambdas.studentNames.length > 2 && ` +${lambdas.studentNames.length - 2} more`}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    {teacher.phone || (
                                                        <span className="text-muted-foreground">No phone</span>
                                                    )}
                                                </div>
                                                {teacher.country && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {teacher.country}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    {teacher.created_at
                                                        ? new Date(teacher.created_at).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {teachersData.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No teachers found in the database
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    } catch (error) {
        console.error("Error rendering teachers table:", error);
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-destructive">
                        Error loading teachers data. Please try again.
                    </div>
                </CardContent>
            </Card>
        );
    }
}
