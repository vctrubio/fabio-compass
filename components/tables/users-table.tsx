import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserType } from "@/rails/model";
import { getRoleBadgeVariant, getRoleBadgeStyle } from "@/components/getters";

interface UsersTableProps {
  users: UserType[];
}

export default function UsersTable({ users }: UsersTableProps) {
  try {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Balance</th>
                  <th className="text-left p-3">SK</th>
                  <th className="text-left p-3">PK</th>
                  <th className="text-left p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-medium">{user.email}</div>
                      <div className="text-sm text-muted-foreground">{user.id}</div>
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={getRoleBadgeVariant(user.role)}
                        style={getRoleBadgeStyle(user.role)}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className="font-mono">
                        €{user.balance || 0}
                      </span>
                    </td>
                    <td className="p-3">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {user.sk ? user.sk.slice(0, 8) + '...' : 'null'}
                      </code>
                    </td>
                    <td className="p-3">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {user.pk ? user.pk.slice(0, 8) + '...' : 'null'}
                      </code>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        {user.created_at 
                          ? new Date(user.created_at).toLocaleDateString() 
                          : 'N/A'
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found in the database
            </div>
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("Error rendering users table:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error loading users data. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }
}
