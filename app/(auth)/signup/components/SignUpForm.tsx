import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/auth-actions";

interface SignUpFormProps {
  role: string;
}

export function SignUpForm({ role }: SignUpFormProps) {
  const roleLabel = role === "organizer" ? "Organizer" : "Mathlete";
  const roleDescription = role === "organizer" 
    ? "Create and manage math competitions" 
    : "Compete in math challenges and climb leaderboards";

  return (
    <Card className="mx-auto max-w-md w-full shadow-xl">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            role === "organizer" 
              ? "bg-[#f49700]/10 text-[#f49700] border border-[#f49700]/20" 
              : "bg-[#25346A]/10 text-[#25346A] border border-[#25346A]/20"
          }`}>
            {roleLabel}
          </span>
        </div>
        <CardDescription>
          {roleDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action="">
          <input type="hidden" name="role" value={role} />
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  name="first-name"
                  id="first-name"
                  placeholder="Max"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  name="last-name"
                  id="last-name"
                  placeholder="Robinson"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input name="password" id="password" type="password" required />
            </div>
            <Button formAction={signup} type="submit" className={`w-full ${
              role === "organizer"
                ? "bg-[#f49700] hover:bg-[#d68400] text-white"
                : "bg-[#25346A] hover:bg-[#1a2550] text-white"
            }`}>
              Create {roleLabel} account
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/signup" className="text-[#25346A] hover:underline font-medium">
            ← Choose a different role
          </Link>
          {" · "}
          Already have an account?{" "}
          <Link href="/login" className="text-[#25346A] hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
