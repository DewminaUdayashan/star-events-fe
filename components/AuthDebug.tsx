"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AuthDebug() {
  const { user, token, roles, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <p>Loading auth state...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Auth Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-400">Authenticated:</p>
          <Badge variant={isAuthenticated ? "default" : "destructive"}>
            {isAuthenticated ? "Yes" : "No"}
          </Badge>
        </div>

        {user && (
          <div>
            <p className="text-sm text-gray-400">User:</p>
            <p className="text-white text-sm">{user.fullName}</p>
            <p className="text-gray-300 text-xs">{user.email}</p>
          </div>
        )}

        {roles.length > 0 && (
          <div>
            <p className="text-sm text-gray-400">Roles:</p>
            <div className="flex gap-2">
              {roles.map((role) => (
                <Badge
                  key={role}
                  variant="outline"
                  className="text-purple-400 border-purple-400"
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {token && (
          <div>
            <p className="text-sm text-gray-400">Token:</p>
            <p className="text-xs text-green-400 font-mono break-all">
              {token.substring(0, 50)}...
            </p>
          </div>
        )}

        {isAuthenticated && (
          <Button onClick={logout} variant="destructive" size="sm">
            Logout
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
