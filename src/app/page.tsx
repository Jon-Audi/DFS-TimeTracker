
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listUsers, ensureAdminExists } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State to manage the initial setup process
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const setupAdminAndFetchUsers = async () => {
      try {
        await ensureAdminExists();
        // Once admin check is complete, trigger a fetch of the users
        await queryClient.refetchQueries({ queryKey: ['users'] });
      } catch (error) {
        console.error("Error during initialization:", error);
        toast({
          title: "Initialization Failed",
          description: "Could not set up initial user data. Please refresh.",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };
    setupAdminAndFetchUsers();
  }, [queryClient, toast]);

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
    // Disable the query from running automatically on mount
    // We will trigger it manually after the admin check.
    enabled: false, 
  });
  
  const isLoading = isInitializing || isLoadingUsers;

  const handleLogin = () => {
    if (!selectedUserId || !users) return;
    
    const user = users.find(u => u.employeeId === selectedUserId);
    if (user && user.pin === pin) {
      if (user.role === 'Admin') {
        router.push('/admin');
      } else {
        router.push(`/employee?employeeId=${user.employeeId}`);
      }
    } else {
      toast({
        title: "Login Failed",
        description: "The PIN you entered is incorrect. Please try again.",
        variant: "destructive",
      });
      setPin("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Delaware Fence Solutions</CardTitle>
          <CardDescription>Time Clock Login</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="user-select">Select User</Label>
             <Select onValueChange={setSelectedUserId} disabled={isLoading}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder={isLoading ? "Loading users..." : "Select your name"} />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                    </div>
                ) : (
                  users?.map(user => (
                    <SelectItem key={user.employeeId} value={user.employeeId}>
                      {user.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {selectedUserId && (
             <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                placeholder="Enter your 4-digit PIN"
                onKeyDown={handleKeyPress}
                autoFocus
              />
            </div>
          )}

          <Button onClick={handleLogin} disabled={!selectedUserId || pin.length !== 4 || isLoading} className="w-full h-11 text-lg">
            <LogIn className="mr-2" />
            Login
          </Button>
          
        </CardContent>
      </Card>
       <footer className="text-center text-muted-foreground mt-8 text-sm">
          <p>DFS Time Tracker | © {new Date().getFullYear()}</p>
        </footer>
    </div>
  );
}
