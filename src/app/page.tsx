
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { dataConnect } from "@/lib/dataconnect";
import { queries } from "@firebasegen/default-connector/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, BrainCircuit, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";


export default function LoginPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    ...queries.listUsers.getOptions(),
    queryFn: () => queries.listUsers(dataConnect)
  });

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

          <Button onClick={handleLogin} disabled={!selectedUserId || pin.length !== 4} className="w-full h-11 text-lg">
            <LogIn className="mr-2" />
            Login
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or try our AI demo
              </span>
            </div>
          </div>

          <Button variant="outline" asChild>
              <Link href="/ai-demo">
                <BrainCircuit className="mr-2" />
                AI Demo
              </Link>
          </Button>
          
        </CardContent>
      </Card>
       <footer className="text-center text-muted-foreground mt-8 text-sm">
          <p>DFS Time Tracker | © {new Date().getFullYear()}</p>
        </footer>
    </div>
  );
}
