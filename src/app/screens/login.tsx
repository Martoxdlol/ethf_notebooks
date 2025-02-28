import { Button } from "@/components/ui/button";
import { authClient } from "../../lib/auth-client";

export function LoginScreen() {
    return (
        <div>
            <Button
                type='button'
                onClick={() => authClient.signIn.social({ provider: 'microsoft', })}>Sign in with Microsoft</Button>
        </div>
    )
}
