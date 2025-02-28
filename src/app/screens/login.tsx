import { Button } from '@/components/ui/button'
import { authClient } from '../../lib/auth-client'

export function LoginScreen() {
    return (
        <div className='flex size-full items-center justify-center'>
            <Button type='button' onClick={() => authClient.signIn.social({ provider: 'microsoft' })}>
                Ingresar con Microsoft
            </Button>
        </div>
    )
}
